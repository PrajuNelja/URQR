package com.nelja.urqr.billing.catalog.service;

import com.nelja.urqr.billing.catalog.category.MenuCategory;
import com.nelja.urqr.billing.catalog.category.MenuCategoryRepository;
import com.nelja.urqr.billing.catalog.dto.CatalogCategoryDto;
import com.nelja.urqr.billing.catalog.dto.CatalogProductDto;
import com.nelja.urqr.billing.catalog.item.MenuCatalogCache;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Tenant-scoped catalog queries; the controller stays focused on HTTP inputs and JSON output. */
@Service
public class CatalogService {

    private static final int MAX_PAGE_SIZE = 100;

    private final MenuCatalogCache catalogCache;
    private final MenuCategoryRepository categories;

    public CatalogService(MenuCatalogCache catalogCache, MenuCategoryRepository categories) {
        this.catalogCache = catalogCache;
        this.categories = categories;
    }

    public Page<CatalogProductDto> products(UUID tenantId, UUID categoryId, Boolean available, Pageable requested) {
        if (categoryId != null && categories.findByIdAndHotelId(categoryId, tenantId)
                .filter(MenuCategory::isActive).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Active category not found in this hotel");
        }

        List<CatalogProductDto> products = new ArrayList<>(catalogCache.get(tenantId).stream()
                .filter(product -> categoryId == null || product.categoryId().equals(categoryId))
                .filter(product -> available == null || product.available() == available)
                .toList());
        Pageable pageable = boundedPageable(requested, List.of("name", "price", "id"));
        products.sort(productComparator(pageable.getSort()));
        return page(products, pageable);
    }

    public Page<CatalogCategoryDto> categories(UUID tenantId, boolean activeOnly, Pageable requested) {
        List<MenuCategory> rows = activeOnly
                ? categories.findAllByHotelIdAndActiveTrueOrderByName(tenantId)
                : categories.findAllByHotelIdOrderByName(tenantId);
        List<CatalogCategoryDto> result = new ArrayList<>(rows.stream()
                .map(category -> new CatalogCategoryDto(
                        category.getId(), category.getName(), category.isActive()))
                .toList());
        Pageable pageable = boundedPageable(requested, List.of("name", "active", "id"));
        result.sort(categoryComparator(pageable.getSort()));
        return page(result, pageable);
    }

    private static Pageable boundedPageable(Pageable requested, List<String> allowedSorts) {
        if (requested == null || requested.isUnpaged()) {
            return PageRequest.of(0, MAX_PAGE_SIZE, Sort.by("name").ascending());
        }
        for (Sort.Order order : requested.getSort()) {
            if (!allowedSorts.contains(order.getProperty())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unsupported catalog sort field: " + order.getProperty());
            }
        }
        int size = Math.max(1, Math.min(requested.getPageSize(), MAX_PAGE_SIZE));
        Sort sort = requested.getSort().isSorted() ? requested.getSort() : Sort.by("name").ascending();
        return PageRequest.of(requested.getPageNumber(), size, sort);
    }

    private static Comparator<CatalogProductDto> productComparator(Sort sort) {
        Comparator<CatalogProductDto> result = null;
        for (Sort.Order order : sort) {
            Comparator<CatalogProductDto> next = switch (order.getProperty()) {
                case "name" -> Comparator.comparing(CatalogProductDto::name, String.CASE_INSENSITIVE_ORDER);
                case "price" -> Comparator.comparing(CatalogProductDto::price);
                case "id" -> Comparator.comparing(CatalogProductDto::id);
                default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unsupported catalog sort field: " + order.getProperty());
            };
            result = result == null ? (order.isDescending() ? next.reversed() : next)
                    : result.thenComparing(order.isDescending() ? next.reversed() : next);
        }
        return result == null ? Comparator.comparing(CatalogProductDto::id)
                : result.thenComparing(CatalogProductDto::id);
    }

    private static Comparator<CatalogCategoryDto> categoryComparator(Sort sort) {
        Comparator<CatalogCategoryDto> result = null;
        for (Sort.Order order : sort) {
            Comparator<CatalogCategoryDto> next = switch (order.getProperty()) {
                case "name" -> Comparator.comparing(CatalogCategoryDto::name, String.CASE_INSENSITIVE_ORDER);
                case "active" -> Comparator.comparing(CatalogCategoryDto::active);
                case "id" -> Comparator.comparing(CatalogCategoryDto::id);
                default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unsupported catalog sort field: " + order.getProperty());
            };
            result = result == null ? (order.isDescending() ? next.reversed() : next)
                    : result.thenComparing(order.isDescending() ? next.reversed() : next);
        }
        return result == null ? Comparator.comparing(CatalogCategoryDto::id)
                : result.thenComparing(CatalogCategoryDto::id);
    }

    private static <T> Page<T> page(List<T> rows, Pageable pageable) {
        int from = (int) Math.min(pageable.getOffset(), rows.size());
        int to = Math.min(from + pageable.getPageSize(), rows.size());
        return new PageImpl<>(rows.subList(from, to), pageable, rows.size());
    }
}
