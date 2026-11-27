package com.nelja.urqr.auth.security;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Sets PostgreSQL's hotel RLS context on the current transaction connection. */
@Component
public class HotelRlsContext {

    @PersistenceContext
    private EntityManager entityManager;

    public void bindHotel(UUID hotelId) {
        if (hotelId == null) {
            throw new IllegalArgumentException("Hotel id is required for hotel-scoped database access");
        }
        requireTransaction();
        entityManager.createNativeQuery("select set_config('app.hotel_id', :hotelId, true)")
                .setParameter("hotelId", hotelId.toString())
                .getSingleResult();
        entityManager.createNativeQuery("select set_config('app.platform_admin', 'false', true)")
                .getSingleResult();
    }

    public void allowPlatformAdministration() {
        requireTransaction();
        entityManager.createNativeQuery("select set_config('app.platform_admin', 'true', true)")
                .getSingleResult();
    }

    private static void requireTransaction() {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException("Hotel RLS context must be set inside a database transaction");
        }
    }
}
