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
import com.nelja.urqr.auth.security.CurrentTenant;
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

    private static final UUID HOTEL_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID CATEGORY_ID = UUID.randomUUID();

    @Mock private MenuItemRepository items;
    @Mock private MenuCatalogCache catalog;
    @Mock private MenuCategoryRepository categories;
    @Mock private CurrentTenant tenant;
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
}
