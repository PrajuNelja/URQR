package com.nelja.urqr.billing.catalog.item;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

class MenuCatalogCacheTest {

    private static final String HOTEL_ID = UUID.randomUUID().toString();
    private static final UUID CATEGORY_ID = UUID.randomUUID();

    private StringRedisTemplate redis;
    private ValueOperations<String, String> values;
    private MenuItemRepository items;
    private MenuCatalogCache catalog;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redis = mock(StringRedisTemplate.class);
        values = mock(ValueOperations.class);
        items = mock(MenuItemRepository.class);
        when(redis.opsForValue()).thenReturn(values);
        catalog = new MenuCatalogCache(redis, new ObjectMapper(), items);
    }

    @Test
    void loadsAndCachesMenuItemsWithinHotelScope() {
        MenuItem tea = new MenuItem(HOTEL_ID, CATEGORY_ID, "Tea", new BigDecimal("4.50"));
        tea.setAvailable(false);
        when(values.get(cacheKey())).thenReturn(null);
        when(items.findPosMenu(HOTEL_ID, null)).thenReturn(List.of(tea));

        var result = catalog.get(HOTEL_ID);

        assertEquals(1, result.size());
        assertEquals("Tea", result.getFirst().name());
        assertEquals(false, result.getFirst().available());
        verify(items).findPosMenu(HOTEL_ID, null);
        verify(values).set(eq(cacheKey()), anyString(), eq(Duration.ofSeconds(60)));
    }

    @Test
    void returnsCachedCatalogWithoutQueryingTheRepository() throws Exception {
        String cached = new ObjectMapper().writeValueAsString(List.of(
                new com.nelja.urqr.billing.catalog.dto.CatalogProductDto(CATEGORY_ID, CATEGORY_ID,
                        "Coffee", new BigDecimal("7.00"), true, BigDecimal.ZERO,
                        BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)));
        when(values.get(cacheKey())).thenReturn(cached);

        var result = catalog.get(HOTEL_ID);

        assertEquals("Coffee", result.getFirst().name());
        verify(items, never()).findPosMenu(HOTEL_ID, null);
    }

    private static String cacheKey() {
        return "hotel:" + HOTEL_ID + ":catalog";
    }
}
