package com.nelja.urqr.auth.hotel;
import org.springframework.transaction.annotation.Transactional;import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.nelja.urqr.auth.audit.AuditService;import com.nelja.urqr.auth.hotel.dto.HotelResponse;import com.nelja.urqr.auth.security.CurrentTenant;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import java.time.LocalTime;import java.util.Map;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.oauth2.jwt.Jwt;import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/hotel") @Transactional @SecurityRequirement(name="bearerAuth")
public class HotelController{
 private final HotelService hotels;
 private final CurrentTenant tenant;
 private final AuditService audit;
 public HotelController(HotelService h,CurrentTenant t,AuditService a){
     hotels=h;tenant=t;audit=a;
 }
 @GetMapping @PreAuthorize("hasAnyRole('MANAGER','CASHIER')")
 public HotelResponse get(@AuthenticationPrincipal Jwt jwt){
     return hotels.getCurrentHotel(tenant.hotelId(jwt));
 }
 @PatchMapping @PreAuthorize("hasRole('MANAGER')")
 public HotelResponse update(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody HotelUpdate x){
     var h=hotels.update(tenant.hotelId(jwt),x.name(),x.currency(),x.timezone(),x.dayCutoff(),x.receiptDetails());
     audit.record(tenant.hotelId(jwt),tenant.userId(jwt),"HOTEL_SETTINGS_CHANGED","Hotel",h.id().toString(),null,"settings updated");
     return h;
 }
 public record HotelUpdate(@NotBlank @Size(max=160)String name,@NotBlank @Size(min=3,max=3)String currency,@NotBlank String timezone,@NotNull LocalTime dayCutoff,Map<String,Object> receiptDetails){}
}
