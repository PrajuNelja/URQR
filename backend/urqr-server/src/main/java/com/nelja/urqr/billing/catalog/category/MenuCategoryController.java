package com.nelja.urqr.billing.catalog.category;

import com.nelja.urqr.billing.catalog.item.MenuCatalogCache;
import com.nelja.urqr.auth.audit.AuditService;
import com.nelja.urqr.auth.security.CurrentTenant;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/menu/categories")
@Transactional
@SecurityRequirement(name = "bearerAuth")
public class MenuCategoryController {
    private final MenuCategoryRepository categories;
    private final CurrentTenant tenant;
    private final AuditService audit;
    private final MenuCatalogCache catalog;

    public MenuCategoryController(MenuCategoryRepository categories, CurrentTenant tenant,
            AuditService audit, MenuCatalogCache catalog) {
        this.categories = categories;
        this.tenant = tenant;
        this.audit = audit;
        this.catalog = catalog;
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public CategoryDto create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CategoryRequest request) {
        UUID hotelId = tenant.hotelId(jwt);
        MenuCategory category = categories.save(new MenuCategory(hotelId, request.name()));
        audit.record(hotelId, tenant.userId(jwt), "CATEGORY_CREATED", "MenuCategory",
                category.getId().toString(), null, category.getName());
        catalog.evictAfterCommit(hotelId);
        return dto(category);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','CASHIER','COOK','WAITER')")
    public List<CategoryDto> list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        UUID hotelId = tenant.hotelId(jwt);
        var rows = activeOnly ? categories.findAllByHotelIdAndActiveTrueOrderByName(hotelId)
                : categories.findAllByHotelIdOrderByName(hotelId);
        return rows.stream().map(MenuCategoryController::dto).toList();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public CategoryDto update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request) {
        UUID hotelId = tenant.hotelId(jwt);
        MenuCategory category = find(id, hotelId);
        String previousName = category.getName();
        category.rename(request.name());
        categories.save(category);
        audit.record(hotelId, tenant.userId(jwt), "CATEGORY_RENAMED", "MenuCategory",
                id.toString(), previousName, category.getName());
        catalog.evictAfterCommit(hotelId);
        return dto(category);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public CategoryDto status(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @RequestBody StatusRequest request) {
        UUID hotelId = tenant.hotelId(jwt);
        MenuCategory category = find(id, hotelId);
        category.setActive(request.active());
        categories.save(category);
        audit.record(hotelId, tenant.userId(jwt), "CATEGORY_STATUS_CHANGED", "MenuCategory",
                id.toString(), null, Boolean.toString(request.active()));
        catalog.evictAfterCommit(hotelId);
        return dto(category);
    }

    private MenuCategory find(UUID id, UUID hotelId) {
        return categories.findByIdAndHotelId(id, hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    private static CategoryDto dto(MenuCategory category) {
        return new CategoryDto(category.getId(), category.getName(), category.isActive());
    }

    public record CategoryRequest(@NotBlank @Size(max = 120) String name) { }
    public record StatusRequest(boolean active) { }
    public record CategoryDto(UUID id, String name, boolean active) { }
}
