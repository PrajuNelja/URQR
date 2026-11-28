package com.nelja.urqr.auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import jakarta.servlet.http.HttpServletResponse;

class OrderIdempotencyFilterTest {

    private static final String HOTEL_ID = UUID.fromString("4d886ed2-aa21-48cf-9694-0e75e2522043").toString();
    private static final UUID USER_ID = UUID.fromString("be266253-ae63-4ff0-9239-8ee6cbafde78");
    private static final String BODY = "{\"items\":[{\"menuItemId\":\"12a02c9c-d0c2-4d03-8cd7-42397705a8a2\",\"quantity\":1}]}";
    private static final String KEY = "checkout-43a31e5b";

    private StringRedisTemplate redis;
    private ValueOperations<String, String> values;
    private ObjectMapper objectMapper;
    private OrderIdempotencyFilter filter;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redis = mock(StringRedisTemplate.class);
        values = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(values);
        objectMapper = new ObjectMapper();
        filter = new OrderIdempotencyFilter(redis, objectMapper, 86400);

        Jwt jwt = Jwt.withTokenValue("test-token")
                .header("alg", "none")
                .claim("sub", "cashier")
                .claim("hotel_id", HOTEL_ID.toString())
                .claim("uid", USER_ID.toString())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_CASHIER"))));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsCachedSuccessfulResponseWithoutRunningCheckoutAgain() throws Exception {
        byte[] responseBody = "{\"id\":\"order-1\"}".getBytes(StandardCharsets.UTF_8);
        String responseKey = OrderIdempotencyFilter.responseKey(HOTEL_ID, USER_ID, KEY);
        String cached = objectMapper.writeValueAsString(new OrderIdempotencyFilter.CachedOrderResponse(
                digest(BODY.getBytes(StandardCharsets.UTF_8)), 201, "application/json", responseBody));
        when(values.get(responseKey)).thenReturn(cached);
        MockHttpServletRequest request = checkoutRequest(KEY, BODY);
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean();

        filter.doFilterInternal(request, response, (req, res) -> chainCalled.set(true));

        assertFalse(chainCalled.get());
        assertEquals(201, response.getStatus());
        assertEquals("application/json", response.getContentType());
        assertEquals(new String(responseBody, StandardCharsets.UTF_8), response.getContentAsString());
        verify(values, never()).setIfAbsent(anyString(), anyString(), any(Duration.class));
    }

    @Test
    void rejectsConcurrentDuplicateImmediatelyWithConflict() throws Exception {
        when(values.get(anyString())).thenReturn(null);
        when(values.setIfAbsent(anyString(), anyString(), eq(OrderIdempotencyFilter.LOCK_TTL))).thenReturn(false);
        MockHttpServletRequest request = checkoutRequest(KEY, BODY);
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean();

        filter.doFilterInternal(request, response, (req, res) -> chainCalled.set(true));

        assertFalse(chainCalled.get());
        assertEquals(409, response.getStatus());
        verify(values).setIfAbsent(anyString(), anyString(), eq(Duration.ofSeconds(120)));
    }

    @Test
    void acquiresTwoMinuteLockAndStoresSuccessfulResponseForRetry() throws Exception {
        when(values.get(anyString())).thenReturn(null);
        when(values.setIfAbsent(anyString(), anyString(), eq(OrderIdempotencyFilter.LOCK_TTL))).thenReturn(true);
        MockHttpServletRequest request = checkoutRequest(KEY, BODY);
        MockHttpServletResponse response = new MockHttpServletResponse();
        byte[] expectedBody = "{\"id\":\"order-2\"}".getBytes(StandardCharsets.UTF_8);

        filter.doFilterInternal(request, response, (req, res) -> {
            assertEquals(BODY, new String(req.getInputStream().readAllBytes(), StandardCharsets.UTF_8));
            HttpServletResponse httpResponse = (HttpServletResponse) res;
            httpResponse.setStatus(201);
            httpResponse.setContentType("application/json");
            httpResponse.getOutputStream().write(expectedBody);
        });

        assertEquals(201, response.getStatus());
        assertEquals(new String(expectedBody, StandardCharsets.UTF_8), response.getContentAsString());
        verify(values).setIfAbsent(anyString(), anyString(), eq(Duration.ofSeconds(120)));
        verify(values).set(eq(OrderIdempotencyFilter.responseKey(HOTEL_ID, USER_ID, KEY)), anyString(),
                eq(Duration.ofSeconds(86400)));
    }

    @Test
    void rejectsMissingIdempotencyKey() throws Exception {
        MockHttpServletRequest request = checkoutRequest(null, BODY);
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean();

        filter.doFilterInternal(request, response, (req, res) -> chainCalled.set(true));

        assertFalse(chainCalled.get());
        assertEquals(400, response.getStatus());
    }

    private static MockHttpServletRequest checkoutRequest(String key, String body) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/orders");
        request.setServletPath("/api/v1/orders");
        request.setContentType("application/json");
        request.setContent(body.getBytes(StandardCharsets.UTF_8));
        if (key != null) request.addHeader(OrderIdempotencyFilter.HEADER, key);
        return request;
    }

    private static String digest(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }
}
