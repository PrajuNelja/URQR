package com.nelja.urqr.access.role;
import org.springframework.transaction.annotation.Transactional;import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.nelja.urqr.audit.AuditService; import com.nelja.urqr.security.CurrentTenant; import com.nelja.urqr.security.RedisAuthStateService; import jakarta.validation.Valid; import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Size; import java.util.*; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.security.oauth2.jwt.Jwt; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/roles")
@PreAuthorize("hasRole('MANAGER')")
@Transactional @SecurityRequirement(name="bearerAuth")
public class RoleController {
 private final RoleRepository roles;
 private final CurrentTenant tenant;
 private final AuditService audit;
 private final RedisAuthStateService authState;
 public RoleController(RoleRepository r,CurrentTenant t,AuditService a,RedisAuthStateService authState){
     roles=r;
     tenant=t;
     audit=a;
     this.authState=authState;
 }
  @PostMapping
  public RoleDto create(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody RoleRequest x){
   String name=HotelStaffRole.normalize(x.name());
   if(!HotelStaffRole.managerCreatedRole(name))throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,"Managers can create COOK or WAITER roles; MANAGER and CASHIER are provisioned with the hotel");
   UUID h=tenant.hotelId(jwt);Role role=roles.save(new Role(h,name));audit.record(h,tenant.userId(jwt),"ROLE_CREATED","Role",role.getId().toString(),null,role.getName());return dto(role);}
 @GetMapping public List<RoleDto> list(@AuthenticationPrincipal Jwt jwt){
     return roles.findAllByHotelIdOrderByName(tenant.hotelId(jwt)).stream().map(RoleController::dto).toList();
 }
  @PatchMapping("/{id}")
  public RoleDto rename(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody RoleRequest x){
     UUID h=tenant.hotelId(jwt);Role r=roles.findByIdAndHotelId(id,h).orElseThrow(()->new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND,"Role not found"));
     String old=r.getName();
     if(HotelStaffRole.supports(old))throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,"Supported staff roles cannot be renamed");
     String name=HotelStaffRole.normalize(x.name());
     if(!HotelStaffRole.managerCreatedRole(name))throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,"Custom roles can only be renamed to COOK or WAITER");
     r.rename(name);
     roles.save(r);
     authState.invalidateHotelAuthorization(h);
     audit.record(h,tenant.userId(jwt),"ROLE_RENAMED","Role",id.toString(),old,r.getName());
     return dto(r);
 }
 private static RoleDto dto(Role r){
     return new RoleDto(r.getId(),r.getName());
 }public record RoleRequest(@NotBlank @Size(max=50)String name){}
    public record RoleDto(UUID id,String name){}
}
