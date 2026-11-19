package com.nelja.urqr.hotel;
import org.springframework.transaction.annotation.Transactional;import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.nelja.urqr.audit.AuditService;import com.nelja.urqr.hotel.dto.HotelResponse;import com.nelja.urqr.security.CurrentTenant;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import java.time.LocalTime;import java.util.Map;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.oauth2.jwt.Jwt;import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/hotel") @Transactional @SecurityRequirement(name="bearerAuth")
public class HotelController{
 private final HotelService hotels;
 private final CurrentTenant tenant;
 private final AuditService audit;
 public HotelController(HotelService h,CurrentTenant t,AuditService a){
     hotels=h;tenant=t;audit=a;
 }
 @GetMapping @PreAuthorize("hasAnyRole('MANAGER','CASHIER')")
 public HotelResponse get(@AuthenticationPrincipal Jwt jwt){return hotels.getCurrentHotel(tenant.hotelId(jwt));}
 @PatchMapping @PreAuthorize("hasRole('MANAGER')")
 public HotelResponse update(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody HotelUpdate x){
     var h=hotels.update(tenant.hotelId(jwt),x.name(),x.currency(),x.timezone(),x.dayCutoff(),x.receiptDetails());
     audit.record(tenant.hotelId(jwt),tenant.userId(jwt),"HOTEL_SETTINGS_CHANGED","Hotel",h.id().toString(),null,"settings updated");return h;
 }
 @PatchMapping("/status") @PreAuthorize("hasRole('MANAGER')")
 public HotelResponse status(@AuthenticationPrincipal Jwt jwt,@RequestBody HotelStatus x){var h=hotels.status(tenant.hotelId(jwt),x.active());audit.record(tenant.hotelId(jwt),tenant.userId(jwt),"HOTEL_STATUS_CHANGED","Hotel",h.id().toString(),null,h.status());return h;}
 public record HotelUpdate(@NotBlank @Size(max=160)String name,@NotBlank @Size(min=3,max=3)String currency,@NotBlank String timezone,@NotNull LocalTime dayCutoff,Map<String,Object> receiptDetails){}public record HotelStatus(boolean active){}
}
