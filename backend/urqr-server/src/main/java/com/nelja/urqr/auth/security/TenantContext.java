package com.nelja.urqr.auth.security;

import java.util.UUID;

/**
 * ThreadLocal storage holder for the active tenant/hotel identifier.
 * Ensures safe retrieval per request thread and prevents memory leaks
 * in virtual threads / thread pools through strict unconditional clearing.
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() { }

    public static void setTenantId(UUID tenantId) {
        if (tenantId != null) {
            CURRENT_TENANT.set(tenantId);
        } else {
            CURRENT_TENANT.remove();
        }
    }

    public static UUID getTenantId() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
