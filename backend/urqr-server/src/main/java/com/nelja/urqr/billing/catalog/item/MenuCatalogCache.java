package com.nelja.urqr.billing.catalog.item;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nelja.urqr.billing.catalog.dto.CatalogProductDto;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Redis cache for the manager POS catalog; the key is scoped to one hotel. */
@Service
public class MenuCatalogCache {

    private static final Duration TTL = Duration.ofSeconds(60);
    private static final TypeReference<List<CatalogProductDto>> CATALOG_TYPE = new TypeReference<>() { };

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final MenuItemRepository items;

    public MenuCatalogCache(StringRedisTemplate redis, ObjectMapper objectMapper, MenuItemRepository items) {
        this.redis = redis;
        this.objectMapper = objectMapper;
        this.items = items;
    }

    public List<CatalogProductDto> get(UUID hotelId) {
        String key = key(hotelId);
        String cached = redis.opsForValue().get(key);
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, CATALOG_TYPE);
            } catch (Exception invalidCacheValue) {
                redis.delete(key);
            }
        }

        List<CatalogProductDto> catalog = items.findPosMenu(hotelId, null).stream()
                .map(item -> new CatalogProductDto(item.getId(), item.getCategoryId(), item.getName(),
                        item.getPrice(), item.isAvailable(), item.getDiscountPercent(), item.getCgstRate(),
                        item.getSgstRate(), item.getVatRate()))
                .toList();
        try {
            redis.opsForValue().set(key, objectMapper.writeValueAsString(catalog), TTL);
        } catch (Exception serializationFailure) {
            throw new IllegalStateException("Catalog response could not be cached", serializationFailure);
        }
        return catalog;
    }

    public void evictAfterCommit(UUID hotelId) {
        String key = key(hotelId);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() { redis.delete(key); }
            });
        } else {
            redis.delete(key);
        }
    }

    private static String key(UUID hotelId) {
        return "hotel:" + hotelId + ":catalog";
    }
}
