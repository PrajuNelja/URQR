package com.nelja.urqr.billing.catalog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.nelja.urqr.billing.catalog.category.MenuCategory;
import com.nelja.urqr.billing.catalog.category.MenuCategoryRepository;
import com.nelja.urqr.billing.catalog.dto.CatalogCategoryDto;
import com.nelja.urqr.billing.catalog.dto.CatalogProductDto;
import com.nelja.urqr.billing.catalog.item.MenuCatalogCache;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class CatalogServiceTest {

    private final UUID hotelId = UUID.randomUUID();
    private final UUID categoryId = UUID.randomUUID();
    private final MenuCatalogCache cache = mock(MenuCatalogCache.class);
    private final MenuCategoryRepository categories = mock(MenuCategoryRepository.class);
    private final CatalogService service = new CatalogService(cache, categories);

    @Test
    void filtersProductsByTenantCategoryAndAvailabilityThenPaginates() {
        MenuCategory activeCategory = new MenuCategory(hotelId, "Drinks");
        when(categories.findByIdAndHotelId(categoryId, hotelId)).thenReturn(Optional.of(activeCategory));
        when(cache.get(hotelId)).thenReturn(List.of(
                product("Tea", categoryId, false),
                product("Coffee", categoryId, true),
                product("Toast", UUID.randomUUID(), true)));

        Page<CatalogProductDto> page = service.products(hotelId, categoryId, true,
                PageRequest.of(0, 1, Sort.by("name").ascending()));

        assertEquals(1, page.getTotalElements());
        assertEquals(1, page.getContent().size());
        assertEquals("Coffee", page.getContent().getFirst().name());
    }

    @Test
    void capsPageSizeAndIncludesOutOfStockOnlyWhenRequested() {
        when(cache.get(hotelId)).thenReturn(List.of(
                product("Tea", categoryId, false), product("Coffee", categoryId, true)));

        Page<CatalogProductDto> page = service.products(hotelId, null, false,
                PageRequest.of(0, 500, Sort.by("name")));

        assertEquals(100, page.getSize());
        assertEquals(List.of("Tea"), page.getContent().stream().map(CatalogProductDto::name).toList());
    }

    @Test
    void filtersInactiveCategoriesAndPaginatesTheResult() {
        MenuCategory active = new MenuCategory(hotelId, "Beverages");
        MenuCategory inactive = new MenuCategory(hotelId, "Seasonal");
        inactive.setActive(false);
        when(categories.findAllByHotelIdAndActiveTrueOrderByName(hotelId)).thenReturn(List.of(active));
        when(categories.findAllByHotelIdOrderByName(hotelId)).thenReturn(List.of(active, inactive));

        Page<CatalogCategoryDto> activePage = service.categories(hotelId, true,
                PageRequest.of(0, 1, Sort.by("name")));
        Page<CatalogCategoryDto> allPage = service.categories(hotelId, false,
                PageRequest.of(1, 1, Sort.by("name")));

        assertEquals(1, activePage.getTotalElements());
        assertEquals("Beverages", activePage.getContent().getFirst().name());
        assertEquals(2, allPage.getTotalElements());
        assertEquals("Seasonal", allPage.getContent().getFirst().name());
        assertEquals(false, allPage.getContent().getFirst().active());
    }

    @Test
    void rejectsInactiveOrForeignCategoryAndUnknownSortFields() {
        MenuCategory inactiveCategory = new MenuCategory(hotelId, "Seasonal");
        inactiveCategory.setActive(false);
        when(categories.findByIdAndHotelId(categoryId, hotelId)).thenReturn(Optional.of(inactiveCategory));

        ResponseStatusException inactive = assertThrows(ResponseStatusException.class,
                () -> service.products(hotelId, categoryId, true, PageRequest.of(0, 20)));
        assertEquals(HttpStatus.BAD_REQUEST, inactive.getStatusCode());

        ResponseStatusException unknownSort = assertThrows(ResponseStatusException.class,
                () -> service.products(hotelId, null, true,
                        PageRequest.of(0, 20, Sort.by("hotelId"))));
        assertEquals(HttpStatus.BAD_REQUEST, unknownSort.getStatusCode());
    }

    private CatalogProductDto product(String name, UUID productCategoryId, boolean available) {
        return new CatalogProductDto(UUID.randomUUID(), productCategoryId, name, new BigDecimal("10.00"),
                available, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
    }
}
