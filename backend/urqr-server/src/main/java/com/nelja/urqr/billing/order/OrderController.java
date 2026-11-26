package com.nelja.urqr.billing.order;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.nelja.urqr.auth.security.CurrentHotel;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import java.math.BigDecimal;import java.util.*;import org.springframework.data.domain.*;
import com.nelja.urqr.billing.payment.PaymentMethod;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.oauth2.jwt.Jwt;import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/orders") @SecurityRequirement(name="bearerAuth") @PreAuthorize("hasAnyRole('MANAGER','CASHIER')")
public class OrderController {
 private final PosOrderService service;
 private final CurrentHotel tenant;
 public OrderController(PosOrderService s,CurrentHotel t){
     service=s;
     tenant=t;}
 @PostMapping @ResponseStatus(HttpStatus.CREATED)
 public PosOrderService.OrderView create(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody OrderRequest x){
     List<PosOrderService.PaymentInput> payments=x.payments()==null?List.of():x.payments().stream().map(p->new PosOrderService.PaymentInput(p.method(),p.amount(),p.reference())).toList();
     return service.create(tenant.hotelId(jwt),tenant.userId(jwt),x.items().stream().map(i->new PosOrderService.LineInput(i.menuItemId(),i.quantity())).toList(),payments);
 }
 @GetMapping public Page<PosOrderService.OrderView> list(@AuthenticationPrincipal Jwt jwt,@RequestParam(required=false)OrderStatus status,@RequestParam(required=false)java.time.Instant from,@RequestParam(required=false)java.time.Instant to,@PageableDefault(size=20,sort="createdAt",direction=Sort.Direction.DESC) Pageable p){if(from!=null&&to!=null&&!from.isBefore(to))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"from must be before to");return service.list(tenant.hotelId(jwt),status,from,to,PageRequest.of(p.getPageNumber(),Math.max(1,Math.min(p.getPageSize(),100)),p.getSort()));}
 @GetMapping("/{id}") public PosOrderService.OrderView get(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id){return service.get(tenant.hotelId(jwt),id);}
 @PatchMapping("/{id}") public PosOrderService.OrderView update(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody OrderRequest x){return service.update(tenant.hotelId(jwt),tenant.userId(jwt),id,x.items().stream().map(i->new PosOrderService.LineInput(i.menuItemId(),i.quantity())).toList());}
 @PostMapping("/{id}/cancel") public PosOrderService.OrderView cancel(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody CancelRequest x){return service.cancel(tenant.hotelId(jwt),tenant.userId(jwt),id,x.reason());}
 @GetMapping("/{id}/bill") public PosOrderService.OrderView bill(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id){return service.bill(tenant.hotelId(jwt),id);}
 public record OrderRequest(@NotEmpty @Size(max=100) List<@Valid LineRequest> items,List<@Valid PaymentRequest> payments){public OrderRequest(List<LineRequest> items){this(items,List.of());}}
 public record LineRequest(@NotNull UUID menuItemId,@Min(1) @Max(999) int quantity){}
 public record PaymentRequest(@NotNull PaymentMethod method,@NotNull @DecimalMin("0.01") @Digits(integer=10,fraction=2) BigDecimal amount,@Size(max=120)String reference){}
 public record CancelRequest(@NotBlank @Size(max=500)String reason){}
}
