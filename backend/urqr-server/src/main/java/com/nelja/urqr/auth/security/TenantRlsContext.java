package com.nelja.urqr.auth.security;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Sets PostgreSQL's RLS context on the same connection used by the current transaction. */
@Component
public class TenantRlsContext {

    @PersistenceContext
    private EntityManager entityManager;

    public void bindTenant(UUID tenantId) {
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant id is required for tenant-scoped database access");
        }
        requireTransaction();
        entityManager.createNativeQuery("select set_config('app.tenant_id', :tenantId, true)")
                .setParameter("tenantId", tenantId.toString())
                .getSingleResult();
    }

    public void allowPlatformAdministration() {
        requireTransaction();
        entityManager.createNativeQuery("select set_config('app.platform_admin', 'true', true)")
                .getSingleResult();
    }

    private static void requireTransaction() {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException("RLS tenant context must be set inside a database transaction");
        }
    }
}
