package com.nelja.urqr.auth.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

class TenantSecurityServiceTest {

    private TenantSecurityService service;

    @BeforeEach
    void setUp() {
        service = new TenantSecurityService();
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void allowsAccessWhenTenantMatchesResource() {
        UUID hotelId = UUID.randomUUID();
        Jwt jwt = Jwt.withTokenValue("mock-jwt")
                .header("alg", "none")
                .claim("sub", "manager")
                .claim("hotel_id", hotelId.toString())
                .build();
        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt, Collections.emptyList());

        assertTrue(service.isTenantMember(auth, hotelId));
    }

    @Test
    void rejectsAccessWhenTenantMismatchesResource() {
        UUID callerHotelId = UUID.randomUUID();
        UUID otherHotelId = UUID.randomUUID();
        Jwt jwt = Jwt.withTokenValue("mock-jwt")
                .header("alg", "none")
                .claim("sub", "manager")
                .claim("hotel_id", callerHotelId.toString())
                .build();
        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt, Collections.emptyList());

        assertFalse(service.isTenantMember(auth, otherHotelId));
    }

    @Test
    void allowsPlatformAdminGlobalAccess() {
        UUID otherHotelId = UUID.randomUUID();
        Jwt jwt = Jwt.withTokenValue("mock-jwt")
                .header("alg", "none")
                .claim("sub", "platform-admin")
                .build();
        JwtAuthenticationToken auth = new JwtAuthenticationToken(
                jwt,
                List.of(new SimpleGrantedAuthority("ROLE_PLATFORM_ADMIN")));

        assertTrue(service.isTenantMember(auth, otherHotelId));
    }

    @Test
    void evaluatesCurrentTenantContext() {
        UUID hotelId = UUID.randomUUID();
        TenantContext.setTenantId(hotelId);

        assertTrue(service.isCurrentTenant(hotelId));
        assertFalse(service.isCurrentTenant(UUID.randomUUID()));
    }
}
