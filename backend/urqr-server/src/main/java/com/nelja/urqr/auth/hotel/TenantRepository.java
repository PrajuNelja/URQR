package com.nelja.urqr.auth.hotel;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    @Query("select tenant.id from Tenant tenant order by tenant.id")
    Page<UUID> findAllIds(Pageable pageable);
}
