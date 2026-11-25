package com.nelja.urqr.billing.payment;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.nelja.urqr.billing.order.PosOrderService;import com.nelja.urqr.auth.security.CurrentTenant;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import java.math.BigDecimal;import java.util.UUID;import org.springframework.http.HttpStatus;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.oauth2.jwt.Jwt;import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") @SecurityRequirement(name="bearerAuth")
public class PaymentController {
 private final PosOrderService service;
 private final CurrentTenant tenant;
 public PaymentController(PosOrderService s,CurrentTenant t){service=s;tenant=t;}
 @PostMapping("/orders/{orderId}/payments") @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasAnyRole('MANAGER','CASHIER')") public PosOrderService.PaymentView pay(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID orderId,@Valid @RequestBody PaymentRequest x){return service.recordPayment(tenant.hotelId(jwt),tenant.userId(jwt),orderId,x.method(),x.amount(),x.referenceNo());}
 public record PaymentRequest(@NotNull PaymentMethod method,@NotNull @DecimalMin(value="0.01") @Digits(integer=10,fraction=2) BigDecimal amount,@Size(max=120)String referenceNo){}
}
