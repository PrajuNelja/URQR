package com.nelja.urqr.order;

import com.nelja.urqr.audit.AuditService;
import com.nelja.urqr.hotel.Hotel;
import com.nelja.urqr.hotel.HotelRepository;
import com.nelja.urqr.menu.item.MenuItem;
import com.nelja.urqr.menu.item.MenuItemRepository;
import com.nelja.urqr.menu.category.MenuCategoryRepository;
import com.nelja.urqr.payment.*;
import com.nelja.urqr.receipt.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
    public PosOrderService(OrderRepository o,OrderItemRepository l,MenuItemRepository m,MenuCategoryRepository categories,PaymentRepository p,ReceiptRepository r,HotelRepository h,AuditService a){
        orders=o;
        lines=l;
        menu=m;
        this.categories=categories;
        payments=p;
        receipts=r;
        hotels=h;
        audit=a;}

    @Transactional
    public OrderView create(UUID hotel,UUID user,List<LineInput> inputs){
        if(inputs==null||inputs.isEmpty()||inputs.size()>100)throw bad("Order must contain between 1 and 100 item lines");
        Order order=orders.save(new Order(hotel,user,"ORD-"+UUID.randomUUID().toString().substring(0,12).toUpperCase()));
        replaceLines(order,hotel,inputs);audit.record(hotel,user,"ORDER_CREATED","Order",order.getId().toString(),null,order.getGrandTotal().toPlainString());return view(order,lines.findAllByHotelIdAndOrderIdOrderById(hotel,order.getId()));
    }
    @Transactional(readOnly=true) public OrderView get(UUID hotel,UUID id){Order o=order(hotel,id);return view(o,lines.findAllByHotelIdAndOrderIdOrderById(hotel,id));}
    @Transactional(readOnly=true) public Page<OrderView> list(UUID hotel,OrderStatus status,Instant from,Instant to,Pageable pageable){Page<Order> page=orders.search(hotel,status,from,to,pageable);List<UUID> ids=page.getContent().stream().map(Order::getId).toList();Map<UUID,List<OrderItem>> byOrder=new HashMap<>();if(!ids.isEmpty())for(OrderItem i:lines.findAllByHotelIdAndOrderIdInOrderById(hotel,ids))byOrder.computeIfAbsent(i.getOrderId(),k->new ArrayList<>()).add(i);return page.map(o->view(o,byOrder.getOrDefault(o.getId(),List.of())));}
    @Transactional public OrderView update(UUID hotel,UUID user,UUID id,List<LineInput> inputs){Order o=orders.findForUpdate(id,hotel).orElseThrow(()->missing("Order not found"));editable(o);if(payments.sumAmount(hotel,id).signum()>0)throw conflict("An order with payments cannot be edited");replaceLines(o,hotel,inputs);audit.record(hotel,user,"ORDER_UPDATED","Order",id.toString(),null,o.getGrandTotal().toPlainString());return get(hotel,id);}
    @Transactional public OrderView cancel(UUID hotel,UUID user,UUID id,String reason){Order o=orders.findForUpdate(id,hotel).orElseThrow(()->missing("Order not found"));if(payments.sumAmount(hotel,id).signum()>0)throw conflict("An order with recorded payments cannot be cancelled");try{o.cancel(reason);}catch(IllegalArgumentException|IllegalStateException e){throw bad(e.getMessage());}orders.save(o);audit.record(hotel,user,"ORDER_CANCELLED","Order",id.toString(),"OPEN","CANCELLED: "+reason.trim());return get(hotel,id);}
    @Transactional(readOnly=true) public OrderView bill(UUID hotel,UUID id){return get(hotel,id);}

    @Transactional public PaymentView recordPayment(UUID hotel,UUID user,UUID orderId,PaymentMethod method,BigDecimal amount,String reference){
        Order o=orders.findForUpdate(orderId,hotel).orElseThrow(()->missing("Order not found"));if(o.getStatus()!=OrderStatus.OPEN)throw conflict("Payments can only be recorded for open orders");money(amount,"Payment amount");
        BigDecimal paid=payments.sumAmount(hotel,orderId);if(paid.add(amount).compareTo(o.getGrandTotal())>0)throw bad("Payment exceeds the outstanding order balance");
        Payment p=payments.save(new Payment(hotel,orderId,method,amount,reference));BigDecimal total=paid.add(amount);
        if(total.compareTo(o.getGrandTotal())==0){o.setPaymentStatus(PaymentStatus.PAID);o.complete();orders.save(o);saveReceipt(hotel,o);}
        else o.setPaymentStatus(PaymentStatus.PARTIAL);
        orders.save(o);audit.record(hotel,user,"PAYMENT_RECORDED","Payment",p.getId().toString(),null,method+" "+amount.toPlainString());return new PaymentView(p.getId(),orderId,p.getMethod(),p.getAmount(),p.getReferenceNo(),p.getCreatedAt(),o.getPaymentStatus());
    }
    @Transactional(readOnly=true) public Receipt receiptForOrder(UUID hotel,UUID orderId){order(hotel,orderId);return receipts.findByHotelIdAndOrderId(hotel,orderId).orElseThrow(()->missing("Receipt not found"));}
    @Transactional(readOnly=true) public Receipt receiptByNumber(UUID hotel,String number){return receipts.findByHotelIdAndReceiptNumber(hotel,number).orElseThrow(()->missing("Receipt not found"));}
    private void replaceLines(Order o,UUID hotel,List<LineInput> inputs){
        if(inputs==null||inputs.isEmpty()||inputs.size()>100)throw bad("Order must contain between 1 and 100 item lines");
        Set<UUID> ids=new HashSet<>();for(LineInput i:inputs){if(i.quantity()<1||i.quantity()>999)throw bad("Quantity must be between 1 and 999");ids.add(i.menuItemId());}
        Map<UUID,MenuItem> items=new HashMap<>();for(MenuItem i:menu.findAllByHotelIdAndIdIn(hotel,ids))if(i.isAvailable())items.put(i.getId(),i);
        if(items.size()!=ids.size())throw bad("One or more menu items are unavailable or belong to another hotel");
        Set<UUID> categoryIds=items.values().stream().map(MenuItem::getCategoryId).collect(java.util.stream.Collectors.toSet());
        if(categories.findAllByHotelIdAndIdInAndActiveTrue(hotel,categoryIds).size()!=categoryIds.size())throw bad("One or more menu items belong to an inactive category");
        lines.deleteAllByHotelIdAndOrderId(hotel,o.getId());BigDecimal total=BigDecimal.ZERO;
        List<OrderItem> newLines=new ArrayList<>();for(LineInput in:inputs){MenuItem m=items.get(in.menuItemId());OrderItem line=new OrderItem(hotel,o.getId(),m.getId(),m.getName(),m.getPrice(),in.quantity());newLines.add(line);total=total.add(line.getLineTotal());}lines.saveAll(newLines);
        if(total.precision()>12)throw bad("Order total exceeds supported amount");o.setTotals(total);orders.save(o);
        if(total.signum()==0){o.setPaymentStatus(PaymentStatus.PAID);o.complete();orders.save(o);saveReceipt(hotel,o);}
    }
    private void saveReceipt(UUID hotel,Order o){if(receipts.findByHotelIdAndOrderId(hotel,o.getId()).isPresent())return;
        Hotel h=hotels.findByIdAndStatus(hotel,"ACTIVE").orElseThrow(()->missing("Hotel not found"));List<Map<String,Object>> lineSnapshot=lines.findAllByHotelIdAndOrderIdOrderById(hotel,o.getId()).stream().map(l->Map.<String,Object>of("name",l.getNameSnapshot(),"price",l.getPriceSnapshot(),"quantity",l.getQuantity(),"lineTotal",l.getLineTotal())).toList();
        Map<String,Object> snapshot=new LinkedHashMap<>();snapshot.put("hotelName",h.getName());snapshot.put("currency",h.getCurrencyCode());snapshot.put("receiptDetails",h.getReceiptDetails());snapshot.put("orderNumber",o.getOrderNumber());snapshot.put("items",lineSnapshot);snapshot.put("subtotal",o.getSubtotal());snapshot.put("grandTotal",o.getGrandTotal());snapshot.put("paidAt",Instant.now().toString());
        receipts.save(new Receipt(hotel,o.getId(),"R-"+UUID.randomUUID().toString().substring(0,16).toUpperCase(),snapshot));
    }
    private Order order(UUID h,UUID id){return orders.findByIdAndHotelId(id,h).orElseThrow(()->missing("Order not found"));}
    private void editable(Order o){if(o.getStatus()!=OrderStatus.OPEN||o.getPaymentStatus()!=PaymentStatus.UNPAID)throw conflict("Only unpaid open orders can be edited");}
    private static void money(BigDecimal a,String what){if(a==null||a.signum()<=0||a.scale()>2||a.precision()>12)throw bad(what+" must be positive with at most two decimal places");}
    private static OrderView view(Order o,List<OrderItem> is){return new OrderView(o.getId(),o.getOrderNumber(),o.getStatus(),o.getPaymentStatus(),o.getSubtotal(),o.getGrandTotal(),o.getCreatedBy(),o.getCancelReason(),o.getCreatedAt(),o.getUpdatedAt(),is.stream().map(i->new LineView(i.getId(),i.getMenuItemId(),i.getNameSnapshot(),i.getPriceSnapshot(),i.getQuantity(),i.getLineTotal())).toList());}
    private static ResponseStatusException missing(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}private static ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.BAD_REQUEST,m);}private static ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}
    public record LineInput(UUID menuItemId,int quantity){}public record LineView(UUID id,UUID menuItemId,String name,BigDecimal price,int quantity,BigDecimal lineTotal){}public record OrderView(UUID id,String orderNumber,OrderStatus status,PaymentStatus paymentStatus,BigDecimal subtotal,BigDecimal grandTotal,UUID createdBy,String cancelReason,Instant createdAt,Instant updatedAt,List<LineView>items){}public record PaymentView(UUID id,UUID orderId,PaymentMethod method,BigDecimal amount,String referenceNo,Instant createdAt,PaymentStatus paymentStatus){}
}
