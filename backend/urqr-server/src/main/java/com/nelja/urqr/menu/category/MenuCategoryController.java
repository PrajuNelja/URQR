package com.nelja.urqr.menu.category;
import org.springframework.transaction.annotation.Transactional;import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.nelja.urqr.platform.security.CurrentTenant; import com.nelja.urqr.platform.audit.AuditService; import jakarta.validation.Valid; import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Size; import java.util.*; import org.springframework.http.HttpStatus; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.security.oauth2.jwt.Jwt; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*; import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api/v1/menu/categories") @Transactional @SecurityRequirement(name="bearerAuth")
public class MenuCategoryController {
 private final MenuCategoryRepository repo; private final CurrentTenant tenant; private final AuditService audit; public MenuCategoryController(MenuCategoryRepository r,CurrentTenant t,AuditService a){repo=r;tenant=t;audit=a;}
 @PostMapping @PreAuthorize("hasRole('MANAGER')")
 public CategoryDto create(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody CategoryRequest x){
     UUID h=tenant.hotelId(jwt);
     var c=repo.save(new MenuCategory(h,x.name()));
     audit.record(h,tenant.userId(jwt),"CATEGORY_CREATED","MenuCategory",c.getId().toString(),null,c.getName());
     return dto(c);}
  @GetMapping @PreAuthorize("hasAnyRole('MANAGER','CASHIER','COOK','WAITER')")
  public List<CategoryDto> list(@AuthenticationPrincipal Jwt jwt,@RequestParam(defaultValue="true")boolean activeOnly){
     UUID h=tenant.hotelId(jwt);
     var rows=activeOnly?repo.findAllByHotelIdAndActiveTrueOrderByName(h):repo.findAllByHotelIdOrderByName(h);
     return rows.stream().map(MenuCategoryController::dto).toList();
 }
 @PatchMapping("/{id}") @PreAuthorize("hasRole('MANAGER')") public CategoryDto update(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody CategoryRequest x){UUID h=tenant.hotelId(jwt);var c=find(id,h);String old=c.getName();c.rename(x.name());repo.save(c);audit.record(h,tenant.userId(jwt),"CATEGORY_RENAMED","MenuCategory",id.toString(),old,c.getName());return dto(c);}
 @PatchMapping("/{id}/status") @PreAuthorize("hasRole('MANAGER')") public CategoryDto status(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@RequestBody StatusRequest x){UUID h=tenant.hotelId(jwt);var c=find(id,h);c.setActive(x.active());repo.save(c);audit.record(h,tenant.userId(jwt),"CATEGORY_STATUS_CHANGED","MenuCategory",id.toString(),null,Boolean.toString(x.active()));return dto(c);}
 private MenuCategory find(UUID id,UUID h){return repo.findByIdAndHotelId(id,h).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Category not found"));}
 private static CategoryDto dto(MenuCategory c){return new CategoryDto(c.getId(),c.getName(),c.isActive());}
 public record CategoryRequest(@NotBlank @Size(max=120) String name){} public record StatusRequest(boolean active){} public record CategoryDto(UUID id,String name,boolean active){}
}
