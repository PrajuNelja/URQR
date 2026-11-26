package com.nelja.urqr.auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

class TenantFilterTest {

    private TenantFilter filter;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new TenantFilter();
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        filterChain = mock(FilterChain.class);
        SecurityContextHolder.clearContext();
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        TenantContext.clear();
    }

    @Test
    void extractsTenantIdFromJwtAndClearsAfterChainCompletion() throws ServletException, IOException {
        UUID expectedHotelId = UUID.randomUUID();
        Jwt jwt = Jwt.withTokenValue("mock-jwt-token")
                .header("alg", "none")
                .claim("sub", "test-user")
                .claim("hotel_id", expectedHotelId.toString())
                .build();
        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        // Capture TenantContext during chain execution
        final UUID[] capturedInChain = new UUID[1];
        FilterChain assertingChain = (req, res) -> {
            capturedInChain[0] = TenantContext.getTenantId();
        };

        filter.doFilterInternal(request, response, assertingChain);

        assertEquals(expectedHotelId, capturedInChain[0]);
        // Unconditionally cleared in finally
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void extractsTenantIdFromHeaderWhenUnauthenticatedAndClears() throws ServletException, IOException {
        UUID headerHotelId = UUID.randomUUID();
        when(request.getHeader(TenantFilter.TENANT_HEADER)).thenReturn(headerHotelId.toString());

        final UUID[] capturedInChain = new UUID[1];
        FilterChain assertingChain = (req, res) -> {
            capturedInChain[0] = TenantContext.getTenantId();
        };

        filter.doFilterInternal(request, response, assertingChain);

        assertEquals(headerHotelId, capturedInChain[0]);
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void jwtAlwaysOverridesSpoofedHeader() throws ServletException, IOException {
        UUID realHotelId = UUID.randomUUID();
        UUID spoofedHotelId = UUID.randomUUID();

        when(request.getHeader(TenantFilter.TENANT_HEADER)).thenReturn(spoofedHotelId.toString());

        Jwt jwt = Jwt.withTokenValue("mock-jwt-token")
                .header("alg", "none")
                .claim("sub", "test-user")
                .claim("hotel_id", realHotelId.toString())
                .build();
        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        final UUID[] capturedInChain = new UUID[1];
        FilterChain assertingChain = (req, res) -> {
            capturedInChain[0] = TenantContext.getTenantId();
        };

        filter.doFilterInternal(request, response, assertingChain);

        assertEquals(realHotelId, capturedInChain[0], "Verified JWT claim must always override untrusted header");
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void ensuresContextIsClearedEvenWhenChainThrowsException() throws ServletException, IOException {
        UUID expectedHotelId = UUID.randomUUID();
        when(request.getHeader(TenantFilter.TENANT_HEADER)).thenReturn(expectedHotelId.toString());

        FilterChain failingChain = (req, res) -> {
            assertEquals(expectedHotelId, TenantContext.getTenantId());
            throw new RuntimeException("Simulated chain failure");
        };

        assertThrows(RuntimeException.class, () -> filter.doFilterInternal(request, response, failingChain));
        assertNull(TenantContext.getTenantId(), "Context must be cleared unconditionally in finally block");
    }
}
