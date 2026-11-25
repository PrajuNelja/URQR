package com.nelja.urqr.auth.security;

import com.nelja.urqr.auth.access.role.RoleRepository;
import com.nelja.urqr.auth.access.user.StaffUserRepository;
import com.nelja.urqr.auth.hotel.HotelRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
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
    private final HotelRepository hotels;
    private final StaffUserRepository users;
    private final RoleRepository roles;
    private final Duration authorizationTtl;

    public RedisAuthStateService(StringRedisTemplate redis, HotelRepository hotels, StaffUserRepository users,
            RoleRepository roles,
            @Value("${app.security.authorization-cache-ttl-seconds:15}") long authorizationTtlSeconds) {
        if (authorizationTtlSeconds < 1 || authorizationTtlSeconds > 300) {
            throw new IllegalArgumentException("AUTHORIZATION_CACHE_TTL_SECONDS must be from 1 to 300");
        }
        this.redis = redis;
        this.hotels = hotels;
        this.users = users;
        this.roles = roles;
        this.authorizationTtl = Duration.ofSeconds(authorizationTtlSeconds);
    }

    public void registerToken(String tokenId, String tokenType, Instant expiresAt, UUID hotelId, UUID userId) {
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

    public String staffRole(UUID hotelId, UUID userId) {
        String cacheKey = staffAuthzKey(hotelId, userId);
        String cachedRole = redis.opsForValue().get(cacheKey);
        if (cachedRole != null) return cachedRole;

        if (hotels.findByIdAndStatus(hotelId, "ACTIVE").isEmpty()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Inactive tenant");
        }
        var user = users.findByIdAndHotelId(userId, hotelId).filter(account -> account.isActive())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Inactive user"));
        var role = roles.findByIdAndHotelId(user.getRoleId(), hotelId)
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid role"));

        redis.opsForValue().set(cacheKey, role.getName(), authorizationTtl);
        String index = hotelStaffIndexKey(hotelId);
        redis.opsForSet().add(index, userId.toString());
        redis.expire(index, INDEX_TTL);
        return role.getName();
    }

    public void invalidateStaffAuthorization(UUID hotelId, UUID userId) {
        afterCommit(() -> redis.delete(staffAuthzKey(hotelId, userId)));
    }

    public void invalidateHotelAuthorization(UUID hotelId) {
        afterCommit(() -> {
            String index = hotelStaffIndexKey(hotelId);
            Set<String> staffIds = redis.opsForSet().members(index);
            if (staffIds != null && !staffIds.isEmpty()) {
                redis.delete(staffIds.stream()
                        .map(id -> staffAuthzKey(hotelId, UUID.fromString(id))).toList());
            }
            redis.delete(index);
        });
    }

    public void revokeHotelTokens(UUID hotelId) {
        afterCommit(() -> {
            String index = hotelTokenIndexKey(hotelId);
            Set<String> tokenIds = redis.opsForSet().members(index);
            if (tokenIds != null && !tokenIds.isEmpty()) {
                redis.delete(tokenIds.stream().map(id -> TOKEN_PREFIX + id).toList());
            }
            redis.delete(index);
        });
    }

    public void revokeStaffTokens(UUID hotelId, UUID userId) {
        afterCommit(() -> {
            String index = staffTokenIndexKey(hotelId, userId);
            Set<String> tokenIds = redis.opsForSet().members(index);
            if (tokenIds != null && !tokenIds.isEmpty()) {
                redis.delete(tokenIds.stream().map(id -> TOKEN_PREFIX + id).toList());
            }
            redis.delete(index);
        });
    }

    private static String staffAuthzKey(UUID hotelId, UUID userId) {
        return STAFF_AUTHZ_PREFIX + hotelId + ":" + userId;
    }

    private static String hotelStaffIndexKey(UUID hotelId) {
        return HOTEL_STAFF_INDEX_PREFIX + hotelId;
    }

    private static String hotelTokenIndexKey(UUID hotelId) {
        return HOTEL_TOKEN_INDEX_PREFIX + hotelId;
    }

    private static String staffTokenIndexKey(UUID hotelId, UUID userId) {
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
