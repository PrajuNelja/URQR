package com.nelja.urqr.auth.security;

/**
 * ThreadLocal storage holder for the active tenant/hotel identifier.
 * Ensures safe retrieval per request thread and prevents memory leaks
 * in virtual threads / thread pools through strict unconditional clearing.
 */
public final class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() { }

    public static void setTenantId(String tenantId) {
        if (tenantId != null) {
            CURRENT_TENANT.set(tenantId);
        } else {
            CURRENT_TENANT.remove();
        }
    }

    public static String getTenantId() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
