package com.nelja.urqr.billing.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nelja.urqr.auth.audit.AuditService;
import com.nelja.urqr.auth.hotel.Hotel;
import com.nelja.urqr.auth.hotel.HotelRepository;
import com.nelja.urqr.billing.catalog.category.MenuCategory;
import com.nelja.urqr.billing.catalog.category.MenuCategoryRepository;
import com.nelja.urqr.billing.catalog.item.MenuItem;
import com.nelja.urqr.billing.catalog.item.MenuItemRepository;
import com.nelja.urqr.billing.outbox.OutboxWriter;
import com.nelja.urqr.billing.payment.Payment;
import com.nelja.urqr.billing.payment.PaymentMethod;
import com.nelja.urqr.billing.payment.PaymentRepository;
import com.nelja.urqr.billing.receipt.ReceiptRepository;
import com.nelja.urqr.common.id.BusinessIdGenerator;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PosOrderServiceTest {

    private static final String HOTEL_ID = UUID.randomUUID().toString();
    private static final String USER_ID = "MGRGRA01";
    private static final String CATEGORY_ID = "CATGRA001";
    private static final String ITEM_ID = "MAIGRA0001";

    @Mock private OrderRepository orders;
    @Mock private OrderItemRepository lines;
    @Mock private MenuItemRepository menu;
    @Mock private MenuCategoryRepository categories;
    @Mock private PaymentRepository payments;
    @Mock private ReceiptRepository receipts;
    @Mock private HotelRepository hotels;
    @Mock private AuditService audit;
    @Mock private OutboxWriter outbox;
    @Mock private BusinessIdGenerator ids;

    @InjectMocks private PosOrderService service;

    private Hotel activeHotel;
    private MenuItem menuItem;
    private MenuCategory menuCategory;

    @BeforeEach
    void setUp() {
        activeHotel = mock(Hotel.class);
        lenient().when(activeHotel.getCurrencyCode()).thenReturn("INR");
        lenient().when(activeHotel.getName()).thenReturn("Grand Horizon");
        lenient().when(hotels.findByIdAndStatus(HOTEL_ID, "ACTIVE")).thenReturn(Optional.of(activeHotel));

        menuItem = new MenuItem(ITEM_ID, HOTEL_ID, CATEGORY_ID, "Masala Dosa", new BigDecimal("120.00"));
        menuItem.update(CATEGORY_ID, "Masala Dosa", new BigDecimal("120.00"), new BigDecimal("2.50"),
                new BigDecimal("2.50"), BigDecimal.ZERO, BigDecimal.ZERO);

        menuCategory = mock(MenuCategory.class);
        lenient().when(menuCategory.getId()).thenReturn(CATEGORY_ID);
        lenient().when(menuCategory.isActive()).thenReturn(true);

        lenient().when(orders.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            if (o.getId() == null) {
                ReflectionTestUtils.setField(o, "id", "GRA202611280001");
            }
            return o;
        });

        lenient().when(outbox.enqueue(eq(HOTEL_ID), any(), any(), any(), any())).thenReturn(UUID.randomUUID());
        lenient().when(ids.nextOrderId(HOTEL_ID)).thenReturn("GRA202611280001");
        lenient().when(ids.nextOrderItemId(HOTEL_ID)).thenReturn("OIGRA001");
        lenient().when(ids.nextPaymentId(eq(HOTEL_ID), any())).thenReturn("CASHGRA20261128001");
        lenient().when(ids.nextReceiptId(HOTEL_ID)).thenReturn("RPTGRA20261128001");
    }

    @Test
    void createOrderCalculatesTotalsAndPersistsSuccessfully() {
        when(menu.findAllByHotelIdAndIdIn(HOTEL_ID, Set.of(ITEM_ID))).thenReturn(List.of(menuItem));
        when(categories.findAllByHotelIdAndIdInAndActiveTrue(HOTEL_ID, Set.of(CATEGORY_ID))).thenReturn(List.of(menuCategory));

        OrderItem lineItem = new OrderItem("OIGRA001", HOTEL_ID, "GRA202611280001", ITEM_ID, "Masala Dosa",
                new BigDecimal("120.00"), 2, BigDecimal.ZERO, new BigDecimal("6.00"),
                new BigDecimal("6.00"), BigDecimal.ZERO, new BigDecimal("252.00"));
        when(lines.findAllByHotelIdAndOrderIdOrderById(eq(HOTEL_ID), any())).thenReturn(List.of(lineItem));

        List<PosOrderService.LineInput> inputs = List.of(new PosOrderService.LineInput(ITEM_ID, 2));

        PosOrderService.OrderView view = service.create(HOTEL_ID, USER_ID, inputs, List.of());

        assertNotNull(view);
        assertEquals(OrderStatus.OPEN, view.status());
        assertEquals(PaymentStatus.UNPAID, view.paymentStatus());
        assertEquals(new BigDecimal("240.00"), view.subtotal());
        assertEquals(new BigDecimal("12.00"), view.taxTotal());
        assertEquals(new BigDecimal("252.00"), view.grandTotal());
        verify(audit).record(eq(HOTEL_ID), eq(USER_ID), eq("ORDER_CREATED"), eq("Order"), any(), any(), any());
        verify(outbox).enqueue(eq(HOTEL_ID), eq("ORDER_CREATED"), eq("Order"), any(), any());
    }

    @Test
    void createOrderRejectsEmptyLines() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.create(HOTEL_ID, USER_ID, List.of(), List.of()));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void createOrderRejectsInvalidQuantity() {
        List<PosOrderService.LineInput> inputs = List.of(new PosOrderService.LineInput(ITEM_ID, 0));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.create(HOTEL_ID, USER_ID, inputs, List.of()));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void createOrderRejectsUnavailableMenuItem() {
        when(menu.findAllByHotelIdAndIdIn(HOTEL_ID, Set.of(ITEM_ID))).thenReturn(List.of());

        List<PosOrderService.LineInput> inputs = List.of(new PosOrderService.LineInput(ITEM_ID, 1));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.create(HOTEL_ID, USER_ID, inputs, List.of()));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void createOrderRejectsInactiveCategory() {
        when(menu.findAllByHotelIdAndIdIn(HOTEL_ID, Set.of(ITEM_ID))).thenReturn(List.of(menuItem));
        when(categories.findAllByHotelIdAndIdInAndActiveTrue(HOTEL_ID, Set.of(CATEGORY_ID))).thenReturn(List.of());

        List<PosOrderService.LineInput> inputs = List.of(new PosOrderService.LineInput(ITEM_ID, 1));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.create(HOTEL_ID, USER_ID, inputs, List.of()));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void createOrderWithFullInitialPaymentCompletesOrder() {
        when(menu.findAllByHotelIdAndIdIn(HOTEL_ID, Set.of(ITEM_ID))).thenReturn(List.of(menuItem));
        when(categories.findAllByHotelIdAndIdInAndActiveTrue(HOTEL_ID, Set.of(CATEGORY_ID))).thenReturn(List.of(menuCategory));

        // 1 item @ 120 + 5% tax (6.00) = 126.00
        List<PosOrderService.LineInput> inputs = List.of(new PosOrderService.LineInput(ITEM_ID, 1));
        List<PosOrderService.PaymentInput> paymentsList = List.of(
                new PosOrderService.PaymentInput(PaymentMethod.CASH, new BigDecimal("126.00"), "CASH-001"));

        PosOrderService.OrderView view = service.create(HOTEL_ID, USER_ID, inputs, paymentsList);

        assertNotNull(view);
        assertEquals(OrderStatus.COMPLETED, view.status());
        assertEquals(PaymentStatus.PAID, view.paymentStatus());
        verify(receipts).save(any());
    }

    @Test
    void createOrderWithPartialInitialPaymentSetsStatusPartial() {
        when(menu.findAllByHotelIdAndIdIn(HOTEL_ID, Set.of(ITEM_ID))).thenReturn(List.of(menuItem));
        when(categories.findAllByHotelIdAndIdInAndActiveTrue(HOTEL_ID, Set.of(CATEGORY_ID))).thenReturn(List.of(menuCategory));

        List<PosOrderService.LineInput> inputs = List.of(new PosOrderService.LineInput(ITEM_ID, 1));
        List<PosOrderService.PaymentInput> paymentsList = List.of(
                new PosOrderService.PaymentInput(PaymentMethod.UPI, new BigDecimal("50.00"), "UPI-REF"));

        PosOrderService.OrderView view = service.create(HOTEL_ID, USER_ID, inputs, paymentsList);

        assertNotNull(view);
        assertEquals(OrderStatus.OPEN, view.status());
        assertEquals(PaymentStatus.PARTIAL, view.paymentStatus());
    }

    @Test
    void cancelOrderSuccessfullyCancelsOpenUnpaidOrder() {
        String orderId = "GRA202611280001";
        Order order = new Order(orderId, HOTEL_ID, USER_ID, "ORD-" + orderId);
        ReflectionTestUtils.setField(order, "id", orderId);

        when(orders.findForUpdate(orderId, HOTEL_ID)).thenReturn(Optional.of(order));
        when(orders.findByIdAndHotelId(orderId, HOTEL_ID)).thenReturn(Optional.of(order));
        when(payments.sumAmount(HOTEL_ID, orderId)).thenReturn(BigDecimal.ZERO);

        PosOrderService.OrderView view = service.cancel(HOTEL_ID, USER_ID, orderId, "Customer changed mind");

        assertNotNull(view);
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(orders).save(order);
        verify(audit).record(eq(HOTEL_ID), eq(USER_ID), eq("ORDER_CANCELLED"), eq("Order"), eq(orderId.toString()), any(), any());
        verify(outbox).enqueue(eq(HOTEL_ID), eq("ORDER_CANCELLED"), eq("Order"), eq(orderId), any());
    }

    @Test
    void cancelOrderRejectsWhenPaymentsRecorded() {
        String orderId = "GRA202611280002";
        Order order = new Order(orderId, HOTEL_ID, USER_ID, "ORD-" + orderId);
        ReflectionTestUtils.setField(order, "id", orderId);

        when(orders.findForUpdate(orderId, HOTEL_ID)).thenReturn(Optional.of(order));
        when(payments.sumAmount(HOTEL_ID, orderId)).thenReturn(new BigDecimal("50.00"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.cancel(HOTEL_ID, USER_ID, orderId, "Cancel request"));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void recordPaymentCompletesOrderOnFullBalance() {
        String orderId = "GRA202611280003";
        Order order = new Order(orderId, HOTEL_ID, USER_ID, "ORD-" + orderId);
        ReflectionTestUtils.setField(order, "id", orderId);
        order.setTotals(new BigDecimal("100.00"), BigDecimal.ZERO, new BigDecimal("5.00"), new BigDecimal("105.00"));

        when(orders.findForUpdate(orderId, HOTEL_ID)).thenReturn(Optional.of(order));
        when(payments.sumAmount(HOTEL_ID, orderId)).thenReturn(BigDecimal.ZERO);
        when(payments.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            ReflectionTestUtils.setField(p, "id", "UPIGRA20261128001");
            return p;
        });

        PosOrderService.PaymentView paymentView = service.recordPayment(HOTEL_ID, USER_ID, orderId,
                PaymentMethod.UPI, new BigDecimal("105.00"), "UPI-REF");

        assertNotNull(paymentView);
        assertEquals(PaymentStatus.PAID, paymentView.paymentStatus());
        assertEquals(OrderStatus.COMPLETED, order.getStatus());
        verify(receipts).save(any());
        verify(audit).record(eq(HOTEL_ID), eq(USER_ID), eq("PAYMENT_RECORDED"), eq("Payment"), any(), any(), any());
    }

    @Test
    void recordPaymentRejectsOverpayment() {
        String orderId = "GRA202611280004";
        Order order = new Order(orderId, HOTEL_ID, USER_ID, "ORD-" + orderId);
        ReflectionTestUtils.setField(order, "id", orderId);
        order.setTotals(new BigDecimal("100.00"), BigDecimal.ZERO, new BigDecimal("5.00"), new BigDecimal("105.00"));

        when(orders.findForUpdate(orderId, HOTEL_ID)).thenReturn(Optional.of(order));
        when(payments.sumAmount(HOTEL_ID, orderId)).thenReturn(new BigDecimal("100.00"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.recordPayment(HOTEL_ID, USER_ID, orderId, PaymentMethod.CASH,
                        new BigDecimal("10.00"), "REF"));
        assertEquals(400, ex.getStatusCode().value());
    }
}
