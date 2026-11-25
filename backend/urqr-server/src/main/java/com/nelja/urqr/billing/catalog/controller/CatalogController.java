package com.nelja.urqr.billing.catalog.controller;

import com.nelja.urqr.auth.security.CurrentTenant;
import com.nelja.urqr.billing.catalog.dto.CatalogCategoryDto;
import com.nelja.urqr.billing.catalog.dto.CatalogProductDto;
import com.nelja.urqr.billing.catalog.service.CatalogService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Read-only catalog contract for checkout clients. */
@RestController
@RequestMapping("/api/v1/catalog")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('MANAGER','CASHIER','COOK','WAITER')")
public class CatalogController {

    private final CatalogService catalog;
    private final CurrentTenant tenant;

    public CatalogController(CatalogService catalog, CurrentTenant tenant) {
        this.catalog = catalog;
        this.tenant = tenant;
    }

    @GetMapping("/products")
    public Page<CatalogProductDto> products(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false, defaultValue = "true") Boolean available,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return catalog.products(tenant.hotelId(jwt), categoryId, available, pageable);
    }

    @GetMapping("/categories")
    public Page<CatalogCategoryDto> categories(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "true") boolean activeOnly,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return catalog.categories(tenant.hotelId(jwt), activeOnly, pageable);
    }
}
