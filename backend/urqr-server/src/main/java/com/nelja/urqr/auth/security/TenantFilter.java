package com.nelja.urqr.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter that extracts the active tenant/hotel ID from the authenticated JWT
 * or incoming HTTP headers and sets it into the TenantContext.
 * Unconditionally clears the ThreadLocal context in a finally block to eliminate
 * thread pollution and carrier-thread memory leaks in Project Loom virtual threads.
 */
@Component
public class TenantFilter extends OncePerRequestFilter {

    public static final String TENANT_HEADER = "X-Tenant-ID";
    public static final String HOTEL_HEADER = "X-Hotel-ID";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String tenantId = resolveTenantId(request);
            if (tenantId != null) {
                TenantContext.setTenantId(tenantId);
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String resolveTenantId(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Cryptographically verified JWT always takes precedence over untrusted headers
        if (authentication instanceof JwtAuthenticationToken jwtAuth && authentication.isAuthenticated()) {
            String hotelClaim = jwtAuth.getToken().getClaimAsString("hotel_id");
            if (validHotelId(hotelClaim)) return hotelClaim.trim();
        }

        // Fallback to headers for unauthenticated requests if provided
        String headerValue = request.getHeader(TENANT_HEADER);
        if (headerValue == null || headerValue.isBlank()) {
            headerValue = request.getHeader(HOTEL_HEADER);
        }
        if (validHotelId(headerValue)) return headerValue.trim();

        return null;
    }

    private static boolean validHotelId(String value) {
        return value != null && !value.isBlank() && value.length() <= 64
                && value.chars().noneMatch(Character::isISOControl);
    }
}
