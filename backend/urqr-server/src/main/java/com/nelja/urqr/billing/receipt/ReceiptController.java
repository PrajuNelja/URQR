package com.nelja.urqr.billing.receipt;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.nelja.urqr.billing.order.PosOrderService;import com.nelja.urqr.auth.security.CurrentHotel;import java.util.Map;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.oauth2.jwt.Jwt;import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") @SecurityRequirement(name="bearerAuth") @PreAuthorize("hasAnyRole('MANAGER','CASHIER')")
public class ReceiptController {
 private final PosOrderService service;private final CurrentHotel tenant;public ReceiptController(PosOrderService s,CurrentHotel t){service=s;tenant=t;}
 @GetMapping("/orders/{orderId}/receipt") public ReceiptView forOrder(@AuthenticationPrincipal Jwt jwt,@PathVariable String orderId){return view(service.receiptForOrder(tenant.hotelId(jwt),orderId));}
 @GetMapping("/receipts/{receiptNumber}") public ReceiptView byNumber(@AuthenticationPrincipal Jwt jwt,@PathVariable String receiptNumber){return view(service.receiptByNumber(tenant.hotelId(jwt),receiptNumber));}
 private ReceiptView view(Receipt r){return new ReceiptView(r.getId(),r.getReceiptNumber(),r.getOrderId(),r.getSnapshot(),r.getCreatedAt());}
 public record ReceiptView(String id,String receiptNumber,String orderId,Map<String,Object> snapshot,java.time.Instant createdAt){}
}
