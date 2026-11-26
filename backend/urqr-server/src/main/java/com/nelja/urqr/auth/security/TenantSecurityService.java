package com.nelja.urqr.auth.security;

import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

/**
 * Evaluates Policy-Based Access Control (PBAC) assertions, verifying that
 * an authenticated caller belongs to the tenant owning the requested resource.
 */
@Service("tenantSecurity")
public class TenantSecurityService {

    public boolean isTenantMember(Authentication authentication, UUID resourceHotelId) {
        if (authentication == null || !authentication.isAuthenticated() || resourceHotelId == null) {
            return false;
        }

        // Platform administrators have global tenant administration privileges
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_PLATFORM_ADMIN".equals(a.getAuthority()))) {
            return true;
        }

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String hotelClaim = jwtAuth.getToken().getClaimAsString("hotel_id");
            if (hotelClaim != null && !hotelClaim.isBlank()) {
                try {
                    UUID tokenHotelId = UUID.fromString(hotelClaim.trim());
                    return tokenHotelId.equals(resourceHotelId);
                } catch (IllegalArgumentException e) {
                    return false;
                }
            }
        }
        return false;
    }

    public boolean isCurrentTenant(UUID resourceHotelId) {
        UUID current = TenantContext.getTenantId();
        return current != null && current.equals(resourceHotelId);
    }
}
