package com.nelja.urqr.auth.security;

import java.util.UUID;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/** Resolves Hibernate's discriminator tenant from the already authenticated JWT. */
@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver<UUID> {

    // Hibernate needs an identifier while Spring Data validates JPQL at startup.
    // This reserved empty identifier never grants PostgreSQL access; RLS still denies
    // rows until TenantRlsTransactionAspect sets a transaction-local tenant context.
    private static final UUID NO_TENANT = new UUID(0L, 0L);

    @Override
    public UUID resolveCurrentTenantIdentifier() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthentication && authentication.isAuthenticated()) {
            String tenantId = jwtAuthentication.getToken().getClaimAsString("hotel_id");
            if (tenantId != null && !tenantId.isBlank()) {
                return UUID.fromString(tenantId);
            }
        }
        return NO_TENANT;
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}
