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
        UUID tenantId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        MenuItemRepository repository = mock(MenuItemRepository.class);
        MenuItem item = new MenuItem(tenantId, categoryId, "Masala Chai", new BigDecimal("80.00"));
        when(repository.findPosMenu(tenantId, null)).thenReturn(List.of(item));
        MenuCatalogCache cache = new MenuCatalogCache(redis, new ObjectMapper(), repository);

        List<CatalogProductDto> firstRead = cache.get(tenantId);
        List<CatalogProductDto> cachedRead = cache.get(tenantId);

        assertEquals(firstRead, cachedRead);
        assertEquals("Masala Chai", cachedRead.getFirst().name());
        assertEquals("80.00", cachedRead.getFirst().price().toPlainString());
        assertEquals("tenant:" + tenantId + ":catalog",
                redis.keys("tenant:" + tenantId + ":catalog").iterator().next());
        verify(repository).findPosMenu(tenantId, null);
        verifyNoMoreInteractions(repository);

        cache.evictAfterCommit(tenantId);
        assertFalse(Boolean.TRUE.equals(redis.hasKey("tenant:" + tenantId + ":catalog")));
    }

    @Test
    void measuresWarmCatalogCacheReadLatency() {
        UUID tenantId = UUID.randomUUID();
        MenuItemRepository repository = mock(MenuItemRepository.class);
        when(repository.findPosMenu(tenantId, null)).thenReturn(List.of());
        MenuCatalogCache cache = new MenuCatalogCache(redis, new ObjectMapper(), repository);
        cache.get(tenantId); // The first read populates Redis; samples below measure cache hits.

        long[] samples = new long[200];
        for (int i = 0; i < samples.length; i++) {
            long started = System.nanoTime();
            cache.get(tenantId);
            samples[i] = System.nanoTime() - started;
        }
        Arrays.sort(samples);
        double p95Millis = samples[189] / 1_000_000.0;
        System.out.printf("CATALOG_CACHE_WARM_P95_MS=%.3f%n", p95Millis);
        assertTrue(p95Millis < 15.0, "Warm catalog cache p95 must stay under 15ms");
    }

    @Test
    void keepsCatalogEntriesSeparateForDifferentTenants() {
        UUID tenantA = UUID.randomUUID();
        UUID tenantB = UUID.randomUUID();
        UUID categoryA = UUID.randomUUID();
        UUID categoryB = UUID.randomUUID();
        MenuItemRepository repository = mock(MenuItemRepository.class);
        when(repository.findPosMenu(tenantA, null)).thenReturn(List.of(
                new MenuItem(tenantA, categoryA, "Tenant A tea", new BigDecimal("10.00"))));
        when(repository.findPosMenu(tenantB, null)).thenReturn(List.of(
                new MenuItem(tenantB, categoryB, "Tenant B tea", new BigDecimal("20.00"))));
        MenuCatalogCache cache = new MenuCatalogCache(redis, new ObjectMapper(), repository);

        assertEquals("Tenant A tea", cache.get(tenantA).getFirst().name());
        assertEquals("Tenant B tea", cache.get(tenantB).getFirst().name());
        assertTrue(Boolean.TRUE.equals(redis.hasKey("tenant:" + tenantA + ":catalog")));
        assertTrue(Boolean.TRUE.equals(redis.hasKey("tenant:" + tenantB + ":catalog")));
    }
}
