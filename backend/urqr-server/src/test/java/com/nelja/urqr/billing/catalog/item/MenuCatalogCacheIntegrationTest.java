package com.nelja.urqr.billing.catalog.item;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nelja.urqr.billing.catalog.dto.CatalogProductDto;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class MenuCatalogCacheIntegrationTest {

    @Container
    private static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:8.2.11-alpine").withExposedPorts(6379);

    private static LettuceConnectionFactory connectionFactory;
    private static StringRedisTemplate redis;

    @BeforeAll
    static void connectToRedis() {
        RedisStandaloneConfiguration server =
                new RedisStandaloneConfiguration(REDIS.getHost(), REDIS.getMappedPort(6379));
        connectionFactory = new LettuceConnectionFactory(server);
        connectionFactory.afterPropertiesSet();
        redis = new StringRedisTemplate(connectionFactory);
        redis.afterPropertiesSet();
    }

    @AfterAll
    static void closeRedis() {
        if (connectionFactory != null) connectionFactory.destroy();
    }

    @Test
    void cachesByTenantAndEvictsAfterProductChange() {
        UUID hotelId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        MenuItemRepository repository = mock(MenuItemRepository.class);
        MenuItem item = new MenuItem(hotelId, categoryId, "Masala Chai", new BigDecimal("80.00"));
        when(repository.findPosMenu(hotelId, null)).thenReturn(List.of(item));
        MenuCatalogCache cache = new MenuCatalogCache(redis, new ObjectMapper(), repository);

        List<CatalogProductDto> firstRead = cache.get(hotelId);
        List<CatalogProductDto> cachedRead = cache.get(hotelId);

        assertEquals(firstRead, cachedRead);
        assertEquals("Masala Chai", cachedRead.getFirst().name());
        assertEquals("80.00", cachedRead.getFirst().price().toPlainString());
        assertEquals("hotel:" + hotelId + ":catalog",
                redis.keys("hotel:" + hotelId + ":catalog").iterator().next());
        verify(repository).findPosMenu(hotelId, null);
        verifyNoMoreInteractions(repository);

        cache.evictAfterCommit(hotelId);
        assertFalse(Boolean.TRUE.equals(redis.hasKey("hotel:" + hotelId + ":catalog")));
    }

    @Test
    void measuresWarmCatalogCacheReadLatency() {
        UUID hotelId = UUID.randomUUID();
        MenuItemRepository repository = mock(MenuItemRepository.class);
        when(repository.findPosMenu(hotelId, null)).thenReturn(List.of());
        MenuCatalogCache cache = new MenuCatalogCache(redis, new ObjectMapper(), repository);
        cache.get(hotelId); // The first read populates Redis; samples below measure cache hits.

        long[] samples = new long[200];
        for (int i = 0; i < samples.length; i++) {
            long started = System.nanoTime();
            cache.get(hotelId);
            samples[i] = System.nanoTime() - started;
        }
        Arrays.sort(samples);
        double p95Millis = samples[189] / 1_000_000.0;
        System.out.printf("CATALOG_CACHE_WARM_P95_MS=%.3f%n", p95Millis);
        assertTrue(p95Millis < 15.0, "Warm catalog cache p95 must stay under 15ms");
    }

    @Test
    void keepsCatalogEntriesSeparateForDifferentHotels() {
        UUID hotelA = UUID.randomUUID();
        UUID hotelB = UUID.randomUUID();
        UUID categoryA = UUID.randomUUID();
        UUID categoryB = UUID.randomUUID();
        MenuItemRepository repository = mock(MenuItemRepository.class);
        when(repository.findPosMenu(hotelA, null)).thenReturn(List.of(
                new MenuItem(hotelA, categoryA, "Tenant A tea", new BigDecimal("10.00"))));
        when(repository.findPosMenu(hotelB, null)).thenReturn(List.of(
                new MenuItem(hotelB, categoryB, "Tenant B tea", new BigDecimal("20.00"))));
        MenuCatalogCache cache = new MenuCatalogCache(redis, new ObjectMapper(), repository);

        assertEquals("Tenant A tea", cache.get(hotelA).getFirst().name());
        assertEquals("Tenant B tea", cache.get(hotelB).getFirst().name());
        assertTrue(Boolean.TRUE.equals(redis.hasKey("hotel:" + hotelA + ":catalog")));
        assertTrue(Boolean.TRUE.equals(redis.hasKey("hotel:" + hotelB + ":catalog")));
    }
}
