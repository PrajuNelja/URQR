package com.nelja.urqr.billing.catalog.item;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nelja.urqr.auth.audit.AuditService;
import com.nelja.urqr.billing.catalog.category.MenuCategory;
import com.nelja.urqr.billing.catalog.category.MenuCategoryRepository;
import com.nelja.urqr.billing.catalog.dto.CatalogProductDto;
import com.nelja.urqr.auth.security.CurrentHotel;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MenuItemControllerTest {

    private static final String HOTEL_ID = UUID.randomUUID().toString();
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID CATEGORY_ID = UUID.randomUUID();

    @Mock private MenuItemRepository items;
    @Mock private MenuCatalogCache catalog;
    @Mock private MenuCategoryRepository categories;
    @Mock private CurrentHotel tenant;
    @Mock private AuditService audit;
    @Captor private ArgumentCaptor<MenuItem> itemCaptor;
    @InjectMocks private MenuItemController controller;

    private Jwt jwt;

    @BeforeEach
    void setUp() {
        jwt = Jwt.withTokenValue("test-token")
                .header("alg", "none")
                .claim("sub", "manager")
                .build();
    }

    @Test
    void createSavesItemForActiveCategoryAndRecordsAuditEvent() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        MenuCategory activeCategory = mock(MenuCategory.class);
        when(activeCategory.isActive()).thenReturn(true);
        when(categories.findByIdAndHotelId(CATEGORY_ID, HOTEL_ID)).thenReturn(Optional.of(activeCategory));

        UUID itemId = UUID.randomUUID();
        MenuItem savedItem = mock(MenuItem.class);
        when(savedItem.getId()).thenReturn(itemId);
        when(savedItem.getCategoryId()).thenReturn(CATEGORY_ID);
        when(savedItem.getName()).thenReturn("Masala Chai");
        when(savedItem.getPrice()).thenReturn(new BigDecimal("80.00"));
        when(savedItem.isAvailable()).thenReturn(true);
        when(items.save(any(MenuItem.class))).thenReturn(savedItem);

        MenuItemController.ItemDto result = controller.create(jwt,
                new MenuItemController.ItemRequest(CATEGORY_ID, "Masala Chai", new BigDecimal("80")));

        verify(items).save(itemCaptor.capture());
        assertEquals(HOTEL_ID, itemCaptor.getValue().getHotelId());
        assertEquals(CATEGORY_ID, itemCaptor.getValue().getCategoryId());
        assertEquals("Masala Chai", itemCaptor.getValue().getName());
        assertEquals(new BigDecimal("80.00"), itemCaptor.getValue().getPrice());
        assertEquals(itemId, result.id());
        assertTrue(result.available());
        verify(audit).record(HOTEL_ID, USER_ID, "MENU_ITEM_CREATED", "MenuItem", itemId.toString(), null,
                "Masala Chai 80.00");
        verify(catalog).evictAfterCommit(HOTEL_ID);
    }

    @Test
    void createRejectsMissingOrInactiveCategory() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(categories.findByIdAndHotelId(CATEGORY_ID, HOTEL_ID)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.create(jwt, new MenuItemController.ItemRequest(CATEGORY_ID, "Tea",
                        new BigDecimal("2.50"))));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(items, never()).save(any(MenuItem.class));
    }

    @Test
    void listFiltersItemsByAvailabilityForCurrentHotel() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        MenuCategory activeCategory = mock(MenuCategory.class);
        when(activeCategory.isActive()).thenReturn(true);
        when(categories.findByIdAndHotelId(CATEGORY_ID, HOTEL_ID)).thenReturn(Optional.of(activeCategory));
        when(catalog.get(HOTEL_ID)).thenReturn(List.of(
                new CatalogProductDto(UUID.randomUUID(), CATEGORY_ID, "Coffee", new BigDecimal("3.50"), true,
                        BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO),
                new CatalogProductDto(UUID.randomUUID(), CATEGORY_ID, "Tea", new BigDecimal("2.50"), false,
                        BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)));

        List<MenuItemController.ItemDto> result = controller.list(jwt, CATEGORY_ID, true);

        assertEquals(1, result.size());
        assertEquals("Coffee", result.getFirst().name());
        assertTrue(result.getFirst().available());
        verify(catalog).get(HOTEL_ID);
    }

    @Test
    void listAllReturnsItemsAcrossCategoriesIncludingUnavailableItems() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        MenuItem chai = mock(MenuItem.class);
        when(chai.getId()).thenReturn(UUID.randomUUID());
        when(chai.getCategoryId()).thenReturn(CATEGORY_ID);
        when(chai.getCategoryName()).thenReturn("Beverages");
        when(chai.getName()).thenReturn("Masala Chai");
        when(chai.getPrice()).thenReturn(new BigDecimal("80.00"));
        when(chai.isAvailable()).thenReturn(true);
        when(chai.getDiscountPercent()).thenReturn(BigDecimal.ZERO);
        when(chai.getCgstRate()).thenReturn(BigDecimal.ZERO);
        when(chai.getSgstRate()).thenReturn(BigDecimal.ZERO);
        when(chai.getVatRate()).thenReturn(BigDecimal.ZERO);

        MenuItem dosa = mock(MenuItem.class);
        UUID dosaCategoryId = UUID.randomUUID();
        when(dosa.getId()).thenReturn(UUID.randomUUID());
        when(dosa.getCategoryId()).thenReturn(dosaCategoryId);
        when(dosa.getCategoryName()).thenReturn("South Meals");
        when(dosa.getName()).thenReturn("Masala Dosa");
        when(dosa.getPrice()).thenReturn(new BigDecimal("120.00"));
        when(dosa.isAvailable()).thenReturn(false);
        when(dosa.getDiscountPercent()).thenReturn(BigDecimal.ZERO);
        when(dosa.getCgstRate()).thenReturn(BigDecimal.ZERO);
        when(dosa.getSgstRate()).thenReturn(BigDecimal.ZERO);
        when(dosa.getVatRate()).thenReturn(BigDecimal.ZERO);
        when(items.findAllActiveWithCategory(HOTEL_ID)).thenReturn(List.of(chai, dosa));

        List<MenuItemController.AllItemDto> result = controller.listAll(jwt);

        assertEquals(2, result.size());
        assertEquals("Beverages", result.get(0).categoryName());
        assertEquals("Masala Chai", result.get(0).name());
        assertTrue(result.get(0).available());
        assertEquals("South Meals", result.get(1).categoryName());
        assertEquals("Masala Dosa", result.get(1).name());
        assertEquals(false, result.get(1).available());
        verify(items).findAllActiveWithCategory(HOTEL_ID);
    }

    @Test
    void getReturnsOnlyAnActiveItemFromTheCurrentHotel() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        UUID itemId = UUID.randomUUID();
        MenuItem item = new MenuItem(HOTEL_ID, CATEGORY_ID, "Coffee", new BigDecimal("3.50"));
        when(items.findByIdAndHotelIdAndActiveTrue(itemId, HOTEL_ID)).thenReturn(Optional.of(item));

        MenuItemController.ItemDto result = controller.get(jwt, itemId);

        assertEquals("Coffee", result.name());
        assertEquals(new BigDecimal("3.50"), result.price());
        verify(items).findByIdAndHotelIdAndActiveTrue(itemId, HOTEL_ID);
    }

    @Test
    void updateChangesTheItemAndEvictsTheCatalog() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        UUID itemId = UUID.randomUUID();
        MenuCategory activeCategory = mock(MenuCategory.class);
        when(activeCategory.isActive()).thenReturn(true);
        when(categories.findByIdAndHotelId(CATEGORY_ID, HOTEL_ID)).thenReturn(Optional.of(activeCategory));
        MenuItem item = new MenuItem(HOTEL_ID, CATEGORY_ID, "Coffee", new BigDecimal("3.50"));
        when(items.findByIdAndHotelIdAndActiveTrue(itemId, HOTEL_ID)).thenReturn(Optional.of(item));

        MenuItemController.ItemDto result = controller.update(jwt, itemId,
                new MenuItemController.ItemRequest(CATEGORY_ID, "Filter Coffee", new BigDecimal("4.00")));

        assertEquals("Filter Coffee", result.name());
        assertEquals(new BigDecimal("4.00"), result.price());
        verify(items).save(item);
        verify(audit).record(HOTEL_ID, USER_ID, "MENU_ITEM_CHANGED", "MenuItem", itemId.toString(),
                "Coffee 3.50", "Filter Coffee 4.00");
        verify(catalog).evictAfterCommit(HOTEL_ID);
    }

    @Test
    void availabilityCanBeChangedAndItemDeleteIsADeactivation() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        UUID itemId = UUID.randomUUID();
        MenuItem item = new MenuItem(HOTEL_ID, CATEGORY_ID, "Coffee", new BigDecimal("3.50"));
        when(items.findByIdAndHotelIdAndActiveTrue(itemId, HOTEL_ID)).thenReturn(Optional.of(item));

        MenuItemController.ItemDto result = controller.availability(jwt, itemId,
                new MenuItemController.AvailabilityRequest(false));
        assertEquals(false, result.available());
        controller.deactivate(jwt, itemId);

        assertEquals(false, item.isAvailable());
        verify(items, org.mockito.Mockito.times(2)).save(item);
        verify(audit).record(HOTEL_ID, USER_ID, "MENU_ITEM_AVAILABILITY_CHANGED", "MenuItem", itemId.toString(),
                null, "false");
        verify(audit).record(HOTEL_ID, USER_ID, "MENU_ITEM_DEACTIVATED", "MenuItem", itemId.toString(), null,
                "Coffee");
        verify(catalog, org.mockito.Mockito.times(2)).evictAfterCommit(HOTEL_ID);
    }
}
