package com.nelja.urqr.auth.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Redis-backed token sessions and short-lived, database-derived authorization state. */
@Service
public class RedisAuthStateService {
    private static final String TOKEN_PREFIX = "urqr:auth:token:";
    private static final String STAFF_AUTHZ_PREFIX = "urqr:authz:staff:";
    private static final String HOTEL_STAFF_INDEX_PREFIX = "urqr:authz:hotel-staff:";
    private static final String HOTEL_TOKEN_INDEX_PREFIX = "urqr:auth:hotel-tokens:";
    private static final String STAFF_TOKEN_INDEX_PREFIX = "urqr:auth:staff-tokens:";
    private static final Duration INDEX_TTL = Duration.ofDays(8);

    private final StringRedisTemplate redis;
    private final StaffAuthorizationLookup authorizationLookup;
    private final Duration authorizationTtl;

    public RedisAuthStateService(StringRedisTemplate redis, StaffAuthorizationLookup authorizationLookup,
            @Value("${app.security.authorization-cache-ttl-seconds:15}") long authorizationTtlSeconds) {
        if (authorizationTtlSeconds < 1 || authorizationTtlSeconds > 300) {
            throw new IllegalArgumentException("AUTHORIZATION_CACHE_TTL_SECONDS must be from 1 to 300");
        }
        this.redis = redis;
        this.authorizationLookup = authorizationLookup;
        this.authorizationTtl = Duration.ofSeconds(authorizationTtlSeconds);
    }

    public void registerToken(String tokenId, String tokenType, Instant expiresAt, String hotelId, String userId) {
        Duration ttl = Duration.between(Instant.now(), expiresAt);
        if (tokenId == null || ttl.isNegative() || ttl.isZero()) {
            throw new IllegalArgumentException("Token ID and future expiry are required");
        }
        redis.opsForValue().set(TOKEN_PREFIX + tokenId, tokenType, ttl);
        if (hotelId != null) {
            String index = hotelTokenIndexKey(hotelId);
            redis.opsForSet().add(index, tokenId);
            redis.expire(index, INDEX_TTL);
            if (userId != null) {
                String userIndex = staffTokenIndexKey(hotelId, userId);
                redis.opsForSet().add(userIndex, tokenId);
                redis.expire(userIndex, INDEX_TTL);
            }
        }
    }

    public boolean isActiveToken(String tokenId, String expectedType) {
        if (tokenId == null) return false;
        return expectedType.equals(redis.opsForValue().get(TOKEN_PREFIX + tokenId));
    }

    /** Atomically consume a refresh token so it cannot be replayed. */
    public boolean consumeRefreshToken(String tokenId) {
        if (tokenId == null) return false;
        String tokenType = redis.opsForValue().getAndDelete(TOKEN_PREFIX + tokenId);
        return "refresh".equals(tokenType);
    }

    public String staffRole(String hotelId, String userId) {
        String cacheKey = staffAuthzKey(hotelId, userId);
        String cachedRole = redis.opsForValue().get(cacheKey);
        if (cachedRole != null) return cachedRole;

        String role = authorizationLookup.findActiveRole(hotelId, userId);
        redis.opsForValue().set(cacheKey, role, authorizationTtl);
        String index = hotelStaffIndexKey(hotelId);
        redis.opsForSet().add(index, userId);
        redis.expire(index, INDEX_TTL);
        return role;
    }

    public void invalidateStaffAuthorization(String hotelId, String userId) {
        afterCommit(() -> redis.delete(staffAuthzKey(hotelId, userId)));
    }

    public void invalidateHotelAuthorization(String hotelId) {
        afterCommit(() -> {
            String index = hotelStaffIndexKey(hotelId);
            Set<String> staffIds = redis.opsForSet().members(index);
            if (staffIds != null && !staffIds.isEmpty()) {
                redis.delete(staffIds.stream()
                        .map(id -> staffAuthzKey(hotelId, id)).toList());
            }
            redis.delete(index);
        });
    }

    public void revokeHotelTokens(String hotelId) {
        afterCommit(() -> {
            String index = hotelTokenIndexKey(hotelId);
            Set<String> tokenIds = redis.opsForSet().members(index);
            if (tokenIds != null && !tokenIds.isEmpty()) {
                redis.delete(tokenIds.stream().map(id -> TOKEN_PREFIX + id).toList());
            }
            redis.delete(index);
        });
    }

    public void revokeStaffTokens(String hotelId, String userId) {
        afterCommit(() -> {
            String index = staffTokenIndexKey(hotelId, userId);
            Set<String> tokenIds = redis.opsForSet().members(index);
            if (tokenIds != null && !tokenIds.isEmpty()) {
                redis.delete(tokenIds.stream().map(id -> TOKEN_PREFIX + id).toList());
            }
            redis.delete(index);
        });
    }

    private static String staffAuthzKey(String hotelId, String userId) {
        return STAFF_AUTHZ_PREFIX + hotelId + ":" + userId;
    }

    private static String hotelStaffIndexKey(String hotelId) {
        return HOTEL_STAFF_INDEX_PREFIX + hotelId;
    }

    private static String hotelTokenIndexKey(String hotelId) {
        return HOTEL_TOKEN_INDEX_PREFIX + hotelId;
    }

    private static String staffTokenIndexKey(String hotelId, String userId) {
        return STAFF_TOKEN_INDEX_PREFIX + hotelId + ":" + userId;
    }

    private static void afterCommit(Runnable action) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            action.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
    }
}
