package com.nelja.urqr.billing.order;

import com.nelja.urqr.billing.catalog.category.MenuCategoryRepository;
import com.nelja.urqr.billing.catalog.item.MenuItem;
import com.nelja.urqr.billing.catalog.item.MenuItemRepository;
import com.nelja.urqr.auth.audit.AuditService;
import com.nelja.urqr.auth.hotel.Hotel;
import com.nelja.urqr.auth.hotel.HotelRepository;
import com.nelja.urqr.billing.outbox.OutboxWriter;
import com.nelja.urqr.billing.payment.Payment;
import com.nelja.urqr.billing.payment.PaymentMethod;
import com.nelja.urqr.billing.payment.PaymentRepository;
import com.nelja.urqr.billing.receipt.Receipt;
import com.nelja.urqr.billing.receipt.ReceiptRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PosOrderService {

    private final OrderRepository orders;
    private final OrderItemRepository lines;
    private final MenuItemRepository menu;
    private final MenuCategoryRepository categories;
    private final PaymentRepository payments;
    private final ReceiptRepository receipts;
    private final HotelRepository hotels;
    private final AuditService audit;
    private final OutboxWriter outbox;
    private final OrderCalculationEngine calculation = new OrderCalculationEngine();

    public PosOrderService(OrderRepository orders, OrderItemRepository lines, MenuItemRepository menu,
            MenuCategoryRepository categories, PaymentRepository payments, ReceiptRepository receipts,
            HotelRepository hotels, AuditService audit, OutboxWriter outbox) {
        this.orders = orders;
        this.lines = lines;
        this.menu = menu;
        this.categories = categories;
        this.payments = payments;
        this.receipts = receipts;
        this.hotels = hotels;
        this.audit = audit;
        this.outbox = outbox;
    }

    /** Order, lines, any initial payments, audit, and outbox row commit as one unit. */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public OrderView create(UUID hotelId, UUID userId, List<LineInput> inputs, List<PaymentInput> initialPayments) {
        validateLines(inputs);
        Order order = orders.save(new Order(hotelId, userId,
                "ORD-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase()));
        CalculatedTotals totals = replaceLines(order, hotelId, inputs);
        applyInitialPayments(order, hotelId, initialPayments);
        orders.save(order);
        audit.record(hotelId, userId, "ORDER_CREATED", "Order", order.getId().toString(), null,
                order.getGrandTotal().toPlainString());
        UUID eventId = outbox.enqueue(hotelId, "ORDER_CREATED", "Order", order.getId(),
                Map.of("orderId", order.getId(), "orderNumber", order.getOrderNumber(),
                        "grandTotal", order.getGrandTotal(), "currency", currencyFor(hotelId),
                        "itemCount", inputs.size(), "subtotal", totals.subtotal(),
                        "discountTotal", totals.discount(), "taxTotal", totals.tax()));
        return view(order, lines.findAllByHotelIdAndOrderIdOrderById(hotelId, order.getId()), eventId);
    }

    @Transactional(readOnly = true)
    public OrderView get(UUID hotelId, UUID id) {
        Order order = order(hotelId, id);
        return view(order, lines.findAllByHotelIdAndOrderIdOrderById(hotelId, id), null);
    }

    @Transactional(readOnly = true)
    public Page<OrderView> list(UUID hotelId, OrderStatus status, Instant from, Instant to, Pageable pageable) {
        Page<Order> page = orders.search(hotelId, status == null ? null : status.name(), from, to,
                nativePageable(pageable));
        List<UUID> ids = page.getContent().stream().map(Order::getId).toList();
        Map<UUID, List<OrderItem>> byOrder = new HashMap<>();
        if (!ids.isEmpty()) {
            for (OrderItem item : lines.findAllByHotelIdAndOrderIdInOrderById(hotelId, ids)) {
                byOrder.computeIfAbsent(item.getOrderId(), ignored -> new ArrayList<>()).add(item);
            }
        }
        return page.map(order -> view(order, byOrder.getOrDefault(order.getId(), List.of()), null));
    }

    /** Native SQL uses database column names, so translate the public entity sort names safely. */
    private static Pageable nativePageable(Pageable pageable) {
        if (pageable.isUnpaged()) return pageable;

        List<Sort.Order> translated = new ArrayList<>();
        for (Sort.Order requested : pageable.getSort()) {
            String column = switch (requested.getProperty()) {
                case "id" -> "id";
                case "createdAt", "created_at" -> "created_at";
                case "updatedAt", "updated_at" -> "updated_at";
                case "orderNumber", "order_number" -> "order_number";
                case "grandTotal", "grand_total" -> "grand_total";
                case "status" -> "status";
                case "paymentStatus", "payment_status" -> "payment_status";
                default -> throw bad("Unsupported order sort field: " + requested.getProperty());
            };
            translated.add(new Sort.Order(requested.getDirection(), column));
        }
        if (translated.isEmpty()) translated.add(new Sort.Order(Sort.Direction.DESC, "created_at"));
        if (translated.stream().noneMatch(order -> order.getProperty().equals("id"))) {
            translated.add(new Sort.Order(Sort.Direction.DESC, "id"));
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(translated));
    }

    @Transactional
    public OrderView update(UUID hotelId, UUID userId, UUID id, List<LineInput> inputs) {
        Order order = orders.findForUpdate(id, hotelId).orElseThrow(() -> missing("Order not found"));
        editable(order);
        if (payments.sumAmount(hotelId, id).signum() > 0) {
            throw conflict("An order with payments cannot be edited");
        }
        replaceLines(order, hotelId, inputs);
        audit.record(hotelId, userId, "ORDER_UPDATED", "Order", id.toString(), null,
                order.getGrandTotal().toPlainString());
        outbox.enqueue(hotelId, "ORDER_UPDATED", "Order", id,
                Map.of("orderId", id, "grandTotal", order.getGrandTotal()));
        return get(hotelId, id);
    }

    @Transactional
    public OrderView cancel(UUID hotelId, UUID userId, UUID id, String reason) {
        Order order = orders.findForUpdate(id, hotelId).orElseThrow(() -> missing("Order not found"));
        if (payments.sumAmount(hotelId, id).signum() > 0) {
            throw conflict("An order with recorded payments cannot be cancelled");
        }
        try {
            order.cancel(reason);
        } catch (IllegalArgumentException | IllegalStateException exception) {
            throw bad(exception.getMessage());
        }
        orders.save(order);
        audit.record(hotelId, userId, "ORDER_CANCELLED", "Order", id.toString(), "OPEN", "CANCELLED: " + reason.trim());
        outbox.enqueue(hotelId, "ORDER_CANCELLED", "Order", id, Map.of("orderId", id, "reason", reason.trim()));
        return get(hotelId, id);
    }

    @Transactional(readOnly = true)
    public OrderView bill(UUID hotelId, UUID id) { return get(hotelId, id); }

    @Transactional
    public PaymentView recordPayment(UUID hotelId, UUID userId, UUID orderId,
            PaymentMethod method, BigDecimal amount, String reference) {
        Order order = orders.findForUpdate(orderId, hotelId).orElseThrow(() -> missing("Order not found"));
        if (order.getStatus() != OrderStatus.OPEN) throw conflict("Payments can only be recorded for open orders");
        money(amount, "Payment amount");
        BigDecimal paid = payments.sumAmount(hotelId, orderId);
        if (paid.add(amount).compareTo(order.getGrandTotal()) > 0) {
            throw bad("Payment exceeds the outstanding order balance");
        }
        Payment payment = payments.save(new Payment(hotelId, orderId, method, amount, reference));
        BigDecimal total = paid.add(amount);
        if (total.compareTo(order.getGrandTotal()) == 0) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.complete();
            orders.save(order);
            saveReceipt(hotelId, order);
        } else {
            order.setPaymentStatus(PaymentStatus.PARTIAL);
        }
        orders.save(order);
        audit.record(hotelId, userId, "PAYMENT_RECORDED", "Payment", payment.getId().toString(), null,
                method + " " + amount.toPlainString());
        outbox.enqueue(hotelId, "PAYMENT_RECORDED", "Order", orderId,
                Map.of("orderId", orderId, "paymentId", payment.getId(), "amount", amount,
                        "method", method.name(), "paymentStatus", order.getPaymentStatus().name()));
        return new PaymentView(payment.getId(), orderId, payment.getMethod(), payment.getAmount(),
                payment.getReferenceNo(), payment.getCreatedAt(), order.getPaymentStatus());
    }

    @Transactional(readOnly = true)
    public Receipt receiptForOrder(UUID hotelId, UUID orderId) {
        order(hotelId, orderId);
        return receipts.findByHotelIdAndOrderId(hotelId, orderId).orElseThrow(() -> missing("Receipt not found"));
    }

    @Transactional(readOnly = true)
    public Receipt receiptByNumber(UUID hotelId, String number) {
        return receipts.findByHotelIdAndReceiptNumber(hotelId, number)
                .orElseThrow(() -> missing("Receipt not found"));
    }

    private CalculatedTotals replaceLines(Order order, UUID hotelId, List<LineInput> inputs) {
        validateLines(inputs);
        Set<UUID> itemIds = new HashSet<>();
        for (LineInput input : inputs) {
            if (input.quantity() < 1 || input.quantity() > 999) throw bad("Quantity must be between 1 and 999");
            itemIds.add(input.menuItemId());
        }
        Map<UUID, MenuItem> items = new HashMap<>();
        for (MenuItem item : menu.findAllByHotelIdAndIdIn(hotelId, itemIds)) {
            if (item.isAvailable()) items.put(item.getId(), item);
        }
        if (items.size() != itemIds.size()) throw bad("One or more menu items are unavailable or belong to another hotel");

        Set<UUID> categoryIds = items.values().stream().map(MenuItem::getCategoryId).collect(Collectors.toSet());
        if (categories.findAllByHotelIdAndIdInAndActiveTrue(hotelId, categoryIds).size() != categoryIds.size()) {
            throw bad("One or more menu items belong to an inactive category");
        }

        lines.deleteAllByHotelIdAndOrderId(hotelId, order.getId());
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2);
        BigDecimal discounts = BigDecimal.ZERO.setScale(2);
        BigDecimal taxes = BigDecimal.ZERO.setScale(2);
        BigDecimal total = BigDecimal.ZERO.setScale(2);
        List<OrderItem> newLines = new ArrayList<>();
        for (LineInput input : inputs) {
            MenuItem item = items.get(input.menuItemId());
            OrderCalculationEngine.LineCalculation line = calculation.calculate(item, input.quantity());
            newLines.add(new OrderItem(hotelId, order.getId(), item.getId(), item.getName(), item.getPrice(),
                    input.quantity(), line.discount(), line.cgst(), line.sgst(), line.vat(), line.total()));
            subtotal = subtotal.add(line.gross());
            discounts = discounts.add(line.discount());
            taxes = taxes.add(line.cgst()).add(line.sgst()).add(line.vat());
            total = total.add(line.total());
        }
        if (total.precision() > 12) throw bad("Order total exceeds supported amount");
        lines.saveAll(newLines);
        order.setTotals(subtotal, discounts, taxes, total);
        orders.save(order);
        if (total.signum() == 0) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.complete();
            saveReceipt(hotelId, order);
        }
        return new CalculatedTotals(subtotal, discounts, taxes, total);
    }

    private void applyInitialPayments(Order order, UUID hotelId, List<PaymentInput> initialPayments) {
        if (initialPayments == null || initialPayments.isEmpty()) return;
        BigDecimal paid = BigDecimal.ZERO.setScale(2);
        for (PaymentInput input : initialPayments) {
            money(input.amount(), "Payment amount");
            paid = paid.add(input.amount());
            if (paid.compareTo(order.getGrandTotal()) > 0) throw bad("Payments exceed the order total");
            payments.save(new Payment(hotelId, order.getId(), input.method(), input.amount(), input.reference()));
        }
        if (paid.signum() == 0) return;
        if (paid.compareTo(order.getGrandTotal()) == 0) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.complete();
            saveReceipt(hotelId, order);
        } else {
            order.setPaymentStatus(PaymentStatus.PARTIAL);
        }
    }

    private void saveReceipt(UUID hotelId, Order order) {
        if (receipts.findByHotelIdAndOrderId(hotelId, order.getId()).isPresent()) return;
        Hotel hotel = hotels.findByIdAndStatus(hotelId, "ACTIVE").orElseThrow(() -> missing("Hotel not found"));
        List<Map<String, Object>> lineSnapshot = lines.findAllByHotelIdAndOrderIdOrderById(hotelId, order.getId())
                .stream().map(line -> Map.<String, Object>of(
                        "name", line.getNameSnapshot(), "price", line.getPriceSnapshot(),
                        "quantity", line.getQuantity(), "discount", line.getDiscountAmount(),
                        "cgst", line.getTaxCgst(), "sgst", line.getTaxSgst(), "vat", line.getTaxVat(),
                        "lineTotal", line.getLineTotal())).toList();
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("hotelName", hotel.getName());
        snapshot.put("currency", hotel.getCurrencyCode());
        snapshot.put("receiptDetails", hotel.getReceiptDetails());
        snapshot.put("orderNumber", order.getOrderNumber());
        snapshot.put("items", lineSnapshot);
        snapshot.put("subtotal", order.getSubtotal());
        snapshot.put("discountTotal", order.getDiscountTotal());
        snapshot.put("taxTotal", order.getTaxTotal());
        snapshot.put("grandTotal", order.getGrandTotal());
        snapshot.put("paidAt", Instant.now().toString());
        receipts.save(new Receipt(hotelId, order.getId(),
                "R-" + UUID.randomUUID().toString().substring(0, 16).toUpperCase(), snapshot));
    }

    private String currencyFor(UUID hotelId) {
        return hotels.findByIdAndStatus(hotelId, "ACTIVE").map(Hotel::getCurrencyCode)
                .orElseThrow(() -> missing("Hotel not found"));
    }

    private Order order(UUID hotelId, UUID id) {
        return orders.findByIdAndHotelId(id, hotelId).orElseThrow(() -> missing("Order not found"));
    }

    private static void validateLines(List<LineInput> inputs) {
        if (inputs == null || inputs.isEmpty() || inputs.size() > 100) {
            throw bad("Order must contain between 1 and 100 item lines");
        }
    }

    private static void editable(Order order) {
        if (order.getStatus() != OrderStatus.OPEN || order.getPaymentStatus() != PaymentStatus.UNPAID) {
            throw conflict("Only unpaid open orders can be edited");
        }
    }

    private static void money(BigDecimal amount, String field) {
        if (amount == null || amount.signum() <= 0 || amount.scale() > 2 || amount.precision() > 12) {
            throw bad(field + " must be positive with at most two decimal places");
        }
    }

    private static OrderView view(Order order, List<OrderItem> items, UUID eventId) {
        return new OrderView(order.getId(), order.getOrderNumber(), order.getStatus(), order.getPaymentStatus(),
                order.getSubtotal(), order.getDiscountTotal(), order.getTaxTotal(), order.getGrandTotal(),
                order.getCreatedBy(), order.getCancelReason(), order.getCreatedAt(), order.getUpdatedAt(), eventId,
                items.stream().map(item -> new LineView(item.getId(), item.getMenuItemId(), item.getNameSnapshot(),
                        item.getPriceSnapshot(), item.getQuantity(), item.getDiscountAmount(), item.getTaxCgst(),
                        item.getTaxSgst(), item.getTaxVat(), item.getLineTotal())).toList());
    }

    private static ResponseStatusException missing(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    public record LineInput(UUID menuItemId, int quantity) { }
    public record PaymentInput(PaymentMethod method, BigDecimal amount, String reference) { }
    public record LineView(UUID id, UUID menuItemId, String name, BigDecimal price, int quantity,
            BigDecimal discount, BigDecimal cgst, BigDecimal sgst, BigDecimal vat, BigDecimal lineTotal) { }
    public record OrderView(UUID id, String orderNumber, OrderStatus status, PaymentStatus paymentStatus,
            BigDecimal subtotal, BigDecimal discountTotal, BigDecimal taxTotal, BigDecimal grandTotal,
            UUID createdBy, String cancelReason, Instant createdAt, Instant updatedAt, UUID eventId,
            List<LineView> items) { }
    public record PaymentView(UUID id, UUID orderId, PaymentMethod method, BigDecimal amount,
            String referenceNo, Instant createdAt, PaymentStatus paymentStatus) { }
    private record CalculatedTotals(BigDecimal subtotal, BigDecimal discount, BigDecimal tax, BigDecimal total) { }
}
