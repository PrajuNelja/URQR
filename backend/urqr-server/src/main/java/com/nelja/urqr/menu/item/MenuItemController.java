package com.nelja.urqr.menu.item;
import org.springframework.transaction.annotation.Transactional;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import com.nelja.urqr.platform.audit.AuditService;
import com.nelja.urqr.menu.category.MenuCategoryRepository;
import com.nelja.urqr.platform.security.CurrentTenant;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/menu/items") @Transactional @SecurityRequirement(name="bearerAuth")
public class MenuItemController {
    private final MenuItemRepository items;
    private final MenuCategoryRepository categories;
    private final CurrentTenant tenant;
    private final AuditService audit;

    public MenuItemController(MenuItemRepository items, MenuCategoryRepository categories, CurrentTenant tenant, AuditService audit) {
        this.items=items; this.categories=categories; this.tenant=tenant; this.audit=audit;
    }

    @PostMapping @PreAuthorize("hasRole('MANAGER')")
    public ItemDto create(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody ItemRequest request) {
        UUID hotel=tenant.hotelId(jwt); requireCategory(request.categoryId(),hotel);
        MenuItem item=items.save(new MenuItem(hotel,request.categoryId(),request.name(),request.price()));
        audit.record(hotel,tenant.userId(jwt),"MENU_ITEM_CREATED","MenuItem",item.getId().toString(),null,item.getName()+" "+item.getPrice());
        return dto(item);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','CASHIER','COOK','WAITER')")
    public List<ItemDto> list(@AuthenticationPrincipal Jwt jwt,@RequestParam(required=false) UUID categoryId,
            @RequestParam(defaultValue="true") Boolean available) {
        UUID hotel=tenant.hotelId(jwt); if(categoryId!=null) requireCategory(categoryId,hotel);
        var result=items.findPosMenu(hotel,categoryId);
        return result.stream().filter(item->available==null||item.isAvailable()==available).map(MenuItemController::dto).toList();
    }

    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('MANAGER','CASHIER','COOK','WAITER')") public ItemDto get(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id){return dto(find(id,tenant.hotelId(jwt)));}

    @PatchMapping("/{id}") @PreAuthorize("hasRole('MANAGER')")
    public ItemDto update(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody ItemRequest request) {
        UUID hotel=tenant.hotelId(jwt); requireCategory(request.categoryId(),hotel); MenuItem item=find(id,hotel);
        String old=item.getName()+" "+item.getPrice(); item.update(request.categoryId(),request.name(),request.price()); items.save(item);
        audit.record(hotel,tenant.userId(jwt),"MENU_ITEM_CHANGED","MenuItem",id.toString(),old,item.getName()+" "+item.getPrice()); return dto(item);
    }

    @PatchMapping("/{id}/availability") @PreAuthorize("hasRole('MANAGER')")
    public ItemDto availability(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@RequestBody AvailabilityRequest request) {
        UUID hotel=tenant.hotelId(jwt); MenuItem item=find(id,hotel); item.setAvailable(request.available()); items.save(item);
        audit.record(hotel,tenant.userId(jwt),"MENU_ITEM_AVAILABILITY_CHANGED","MenuItem",id.toString(),null,Boolean.toString(request.available())); return dto(item);
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasRole('MANAGER')")
    public void deactivate(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id){UUID hotel=tenant.hotelId(jwt);MenuItem item=find(id,hotel);item.deactivate();items.save(item);audit.record(hotel,tenant.userId(jwt),"MENU_ITEM_DEACTIVATED","MenuItem",id.toString(),null,item.getName());}

    private MenuItem find(UUID id,UUID hotel){return items.findByIdAndHotelIdAndActiveTrue(id,hotel).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Menu item not found"));}
    private void requireCategory(UUID id,UUID hotel){if(categories.findByIdAndHotelId(id,hotel).filter(c->c.isActive()).isEmpty())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Active category not found in this hotel");}
    private static ItemDto dto(MenuItem item){return new ItemDto(item.getId(),item.getCategoryId(),item.getName(),item.getPrice(),item.isAvailable());}
    public record ItemRequest(@NotNull UUID categoryId,@NotBlank @Size(max=160) String name,@NotNull @DecimalMin("0.00") @Digits(integer=10,fraction=2) BigDecimal price){}
    public record AvailabilityRequest(boolean available){}
    public record ItemDto(UUID id,UUID categoryId,String name,BigDecimal price,boolean available){}
}
