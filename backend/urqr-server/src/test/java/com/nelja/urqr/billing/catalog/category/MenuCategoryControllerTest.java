package com.nelja.urqr.billing.catalog.category;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nelja.urqr.auth.audit.AuditService;
import com.nelja.urqr.auth.security.CurrentTenant;
import com.nelja.urqr.billing.catalog.item.MenuCatalogCache;
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
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class MenuCategoryControllerTest {

    private static final UUID HOTEL_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();

    @Mock private MenuCategoryRepository categories;
    @Mock private MenuCatalogCache catalog;
    @Mock private CurrentTenant tenant;
    @Mock private AuditService audit;
    @Captor private ArgumentCaptor<MenuCategory> categoryCaptor;
    @InjectMocks private MenuCategoryController controller;

    private Jwt jwt;

    @BeforeEach
    void setUp() {
        jwt = Jwt.withTokenValue("test-token")
                .header("alg", "none")
                .claim("sub", "manager")
                .build();
    }

    @Test
    void createSavesCategoryForCurrentHotelAndRecordsAuditEvent() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        UUID categoryId = UUID.randomUUID();
        MenuCategory savedCategory = mock(MenuCategory.class);
        when(savedCategory.getId()).thenReturn(categoryId);
        when(savedCategory.getName()).thenReturn("Drinks");
        when(savedCategory.isActive()).thenReturn(true);
        when(categories.save(any(MenuCategory.class))).thenReturn(savedCategory);

        MenuCategoryController.CategoryDto result = controller.create(jwt,
                new MenuCategoryController.CategoryRequest(" Drinks "));

        verify(categories).save(categoryCaptor.capture());
        assertEquals(HOTEL_ID, categoryCaptor.getValue().getHotelId());
        assertEquals("Drinks", categoryCaptor.getValue().getName());
        assertEquals(categoryId, result.id());
        assertEquals("Drinks", result.name());
        assertEquals(true, result.active());
        verify(audit).record(HOTEL_ID, USER_ID, "CATEGORY_CREATED", "MenuCategory", categoryId.toString(), null,
                "Drinks");
    }

    @Test
    void listUsesActiveOnlyFilterAndCanIncludeInactiveCategories() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        MenuCategory active = new MenuCategory(HOTEL_ID, "Drinks");
        MenuCategory inactive = new MenuCategory(HOTEL_ID, "Seasonal");
        inactive.setActive(false);
        when(categories.findAllByHotelIdAndActiveTrueOrderByName(HOTEL_ID)).thenReturn(List.of(active));
        when(categories.findAllByHotelIdOrderByName(HOTEL_ID)).thenReturn(List.of(active, inactive));

        List<MenuCategoryController.CategoryDto> activeResult = controller.list(jwt, true);
        List<MenuCategoryController.CategoryDto> allResult = controller.list(jwt, false);

        assertEquals(List.of("Drinks"), activeResult.stream().map(MenuCategoryController.CategoryDto::name).toList());
        assertEquals(2, allResult.size());
        assertFalse(allResult.get(1).active());
        verify(categories).findAllByHotelIdAndActiveTrueOrderByName(HOTEL_ID);
        verify(categories).findAllByHotelIdOrderByName(HOTEL_ID);
    }

    @Test
    void getReadsOneCategoryOnlyWithinTheCurrentHotel() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        UUID categoryId = UUID.randomUUID();
        MenuCategory category = new MenuCategory(HOTEL_ID, "Desserts");
        when(categories.findByIdAndHotelId(categoryId, HOTEL_ID)).thenReturn(Optional.of(category));

        MenuCategoryController.CategoryDto result = controller.get(jwt, categoryId);

        assertEquals("Desserts", result.name());
        verify(categories).findByIdAndHotelId(categoryId, HOTEL_ID);
    }

    @Test
    void updateRenamesCategoryAndEvictsTheHotelCatalog() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        UUID categoryId = UUID.randomUUID();
        MenuCategory category = new MenuCategory(HOTEL_ID, "Old name");
        when(categories.findByIdAndHotelId(categoryId, HOTEL_ID)).thenReturn(Optional.of(category));

        MenuCategoryController.CategoryDto result = controller.update(jwt, categoryId,
                new MenuCategoryController.CategoryRequest(" New name "));

        assertEquals("New name", result.name());
        verify(categories).save(category);
        verify(audit).record(HOTEL_ID, USER_ID, "CATEGORY_RENAMED", "MenuCategory", categoryId.toString(),
                "Old name", "New name");
        verify(catalog).evictAfterCommit(HOTEL_ID);
    }

    @Test
    void statusEndpointDeactivatesCategoryAndRecordsAuditEvent() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        UUID categoryId = UUID.randomUUID();
        MenuCategory category = new MenuCategory(HOTEL_ID, "Drinks");
        when(categories.findByIdAndHotelId(categoryId, HOTEL_ID)).thenReturn(Optional.of(category));

        MenuCategoryController.CategoryDto result = controller.status(jwt, categoryId,
                new MenuCategoryController.StatusRequest(false));

        assertFalse(result.active());
        verify(categories).save(category);
        verify(audit).record(HOTEL_ID, USER_ID, "CATEGORY_STATUS_CHANGED", "MenuCategory", categoryId.toString(),
                null, "false");
    }

    @Test
    void deleteSoftDeactivatesCategoryAndEvictsTheHotelCatalog() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        UUID categoryId = UUID.randomUUID();
        MenuCategory category = new MenuCategory(HOTEL_ID, "Seasonal");
        when(categories.findByIdAndHotelId(categoryId, HOTEL_ID)).thenReturn(Optional.of(category));

        controller.deactivate(jwt, categoryId);

        assertFalse(category.isActive());
        verify(categories).save(category);
        verify(audit).record(HOTEL_ID, USER_ID, "CATEGORY_STATUS_CHANGED", "MenuCategory", categoryId.toString(),
                "true", "false");
        verify(catalog).evictAfterCommit(HOTEL_ID);
    }
}
