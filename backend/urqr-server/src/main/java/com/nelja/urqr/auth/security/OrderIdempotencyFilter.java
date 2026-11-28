package com.nelja.urqr.auth.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nelja.urqr.common.exception.RequestIdFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

/**
 * Redis-backed idempotency for order checkout. The key is scoped to the authenticated
 * hotel and staff user, and completed successful responses are replayed for safe retries.
 */
@Component
public class OrderIdempotencyFilter extends OncePerRequestFilter {

    public static final String HEADER = "Idempotency-Key";
    public static final Duration LOCK_TTL = Duration.ofSeconds(120);
    static final int MAX_REQUEST_BYTES = 1024 * 1024;
    private static final String REDIS_PREFIX = "urqr:idempotency:orders:";
    private static final DefaultRedisScript<Long> RELEASE_LOCK = new DefaultRedisScript<>(
            "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
            Long.class);

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final Duration responseTtl;

    public OrderIdempotencyFilter(StringRedisTemplate redis, ObjectMapper objectMapper,
            @Value("${app.idempotency.response-ttl-seconds:86400}") long responseTtlSeconds) {
        if (responseTtlSeconds < 1 || responseTtlSeconds > 2_592_000) {
            throw new IllegalArgumentException("IDEMPOTENCY_RESPONSE_TTL_SECONDS must be from 1 to 2592000");
        }
        this.redis = redis;
        this.objectMapper = objectMapper;
        this.responseTtl = Duration.ofSeconds(responseTtlSeconds);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !(authentication instanceof JwtAuthenticationToken && authentication.isAuthenticated())
                || !"POST".equalsIgnoreCase(request.getMethod())
                || !("/api/v1/orders".equals(path) || "/api/v1/orders/".equals(path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)
                || !authentication.isAuthenticated()) {
            chain.doFilter(request, response);
            return;
        }

        String hotelId = stringClaim(jwtAuthentication, "hotel_id");
        String userId = stringClaim(jwtAuthentication, "uid");
        if (hotelId == null || userId == null) {
            chain.doFilter(request, response);
            return;
        }

        String idempotencyKey = request.getHeader(HEADER);
        if (idempotencyKey == null || idempotencyKey.isBlank() || idempotencyKey.length() > 255
                || idempotencyKey.chars().anyMatch(Character::isISOControl)) {
            writeError(response, request, HttpStatus.BAD_REQUEST, "IDEMPOTENCY_KEY_REQUIRED",
                    "A valid Idempotency-Key header is required");
            return;
        }

        byte[] requestBody = request.getInputStream().readNBytes(MAX_REQUEST_BYTES + 1);
        if (requestBody.length > MAX_REQUEST_BYTES) {
            writeError(response, request, HttpStatus.PAYLOAD_TOO_LARGE, "REQUEST_TOO_LARGE",
                    "The order request body exceeds the supported size");
            return;
        }

        String keyDigest = sha256(idempotencyKey.trim().getBytes(StandardCharsets.UTF_8));
        String requestDigest = sha256(requestBody);
        String scope = REDIS_PREFIX + hotelId + ":" + userId + ":" + keyDigest;
        String responseKey = scope + ":response";
        String lockKey = scope + ":lock";

        try {
            String cachedJson = redis.opsForValue().get(responseKey);
            if (cachedJson != null) {
                replay(cachedJson, requestDigest, response, request);
                return;
            }

            String lockOwner = UUID.randomUUID().toString();
            Boolean acquired = redis.opsForValue().setIfAbsent(lockKey, lockOwner, LOCK_TTL);
            if (!Boolean.TRUE.equals(acquired)) {
                cachedJson = redis.opsForValue().get(responseKey);
                if (cachedJson != null) {
                    replay(cachedJson, requestDigest, response, request);
                } else {
                    writeError(response, request, HttpStatus.CONFLICT, "IDEMPOTENCY_IN_PROGRESS",
                            "An order request with this Idempotency-Key is already in progress");
                }
                return;
            }

            boolean keepLockUntilExpiry = false;
            try {
                // A previous request may have completed between the first lookup and lock acquisition.
                cachedJson = redis.opsForValue().get(responseKey);
                if (cachedJson != null) {
                    replay(cachedJson, requestDigest, response, request);
                    return;
                }

                ReplayableRequest wrappedRequest = new ReplayableRequest(request, requestBody);
                ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
                chain.doFilter(wrappedRequest, wrappedResponse);

                int status = wrappedResponse.getStatus();
                byte[] responseBody = wrappedResponse.getContentAsByteArray();
                if (status >= 200 && status < 300) {
                    // If the order committed but Redis cannot cache its response, keep the lock
                    // until its TTL so a retry cannot immediately create the order a second time.
                    keepLockUntilExpiry = true;
                    CachedOrderResponse completed = new CachedOrderResponse(requestDigest, status,
                            wrappedResponse.getContentType(), responseBody);
                    redis.opsForValue().set(responseKey, objectMapper.writeValueAsString(completed), responseTtl);
                    keepLockUntilExpiry = false;
                }
                wrappedResponse.copyBodyToResponse();
            } finally {
                if (!keepLockUntilExpiry) releaseLock(lockKey, lockOwner);
            }
        } catch (DataAccessException exception) {
            logger.error("Redis unavailable while processing order idempotency", exception);
            writeError(response, request, HttpStatus.SERVICE_UNAVAILABLE, "IDEMPOTENCY_UNAVAILABLE",
                    "Order checkout is temporarily unavailable");
        } catch (JsonProcessingException exception) {
            logger.error("Could not serialize completed idempotent order response", exception);
            writeError(response, request, HttpStatus.INTERNAL_SERVER_ERROR, "IDEMPOTENCY_RESPONSE_ERROR",
                    "The order response could not be stored for retry");
        }
    }

    private void replay(String cachedJson, String requestDigest, HttpServletResponse response,
            HttpServletRequest request) throws IOException {
        CachedOrderResponse cached;
        try {
            cached = objectMapper.readValue(cachedJson, CachedOrderResponse.class);
        } catch (JsonProcessingException exception) {
            logger.error("Invalid cached order response in Redis", exception);
            writeError(response, request, HttpStatus.SERVICE_UNAVAILABLE, "IDEMPOTENCY_RESPONSE_INVALID",
                    "The stored order response is temporarily unavailable");
            return;
        }
        if (!MessageDigest.isEqual(cached.requestDigest().getBytes(StandardCharsets.US_ASCII),
                requestDigest.getBytes(StandardCharsets.US_ASCII))) {
            writeError(response, request, HttpStatus.CONFLICT, "IDEMPOTENCY_KEY_REUSED",
                    "This Idempotency-Key was already used with a different order request");
            return;
        }
        response.setStatus(cached.status());
        if (cached.contentType() != null) response.setContentType(cached.contentType());
        response.setContentLength(cached.body().length);
        response.getOutputStream().write(cached.body());
    }

    private void releaseLock(String lockKey, String lockOwner) {
        try {
            redis.execute(RELEASE_LOCK, List.of(lockKey), lockOwner);
        } catch (DataAccessException exception) {
            // The 120 second TTL is the safety net if Redis is temporarily unavailable here.
            logger.warn("Could not release order idempotency lock; it will expire by TTL", exception);
        }
    }

    private void writeError(HttpServletResponse response, HttpServletRequest request, HttpStatus status,
            String code, String message) throws IOException {
        response.resetBuffer();
        response.setStatus(status.value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String correlationId = (String) request.getAttribute(RequestIdFilter.ATTRIBUTE);
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("timestamp", Instant.now().toString());
        error.put("status", status.value());
        error.put("code", code);
        error.put("message", message);
        error.put("path", request.getRequestURI());
        error.put("correlationId", correlationId);
        error.put("fieldErrors", List.of());
        objectMapper.writeValue(response.getOutputStream(), error);
    }

    static String responseKey(String hotelId, String userId, String key) {
        return REDIS_PREFIX + hotelId + ":" + userId + ":" + sha256(key.trim().getBytes(StandardCharsets.UTF_8))
                + ":response";
    }

    private static String stringClaim(JwtAuthenticationToken authentication, String claim) {
        try {
            String value = authentication.getToken().getClaimAsString(claim);
            return value != null && !value.isBlank() && value.length() <= 64
                    && value.chars().noneMatch(Character::isISOControl) ? value : null;
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private static String sha256(byte[] value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    record CachedOrderResponse(String requestDigest, int status, String contentType, byte[] body) { }

    private static final class ReplayableRequest extends HttpServletRequestWrapper {
        private final byte[] body;

        private ReplayableRequest(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream input = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override public int read() { return input.read(); }
                @Override public boolean isFinished() { return input.available() == 0; }
                @Override public boolean isReady() { return true; }
                @Override public void setReadListener(ReadListener listener) {
                    try {
                        if (input.available() > 0) listener.onDataAvailable();
                        if (input.available() == 0) listener.onAllDataRead();
                    } catch (IOException exception) {
                        listener.onError(exception);
                    }
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            String encoding = getCharacterEncoding() == null
                    ? StandardCharsets.ISO_8859_1.name() : getCharacterEncoding();
            return new BufferedReader(new InputStreamReader(getInputStream(), java.nio.charset.Charset.forName(encoding)));
        }

        @Override public int getContentLength() { return body.length; }
        @Override public long getContentLengthLong() { return body.length; }
    }
}
