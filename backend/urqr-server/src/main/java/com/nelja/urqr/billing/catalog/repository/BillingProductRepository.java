package com.nelja.urqr.billing.catalog.repository;

import com.nelja.urqr.billing.catalog.entity.BillingProduct;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingProductRepository extends JpaRepository<BillingProduct, UUID> {
    List<BillingProduct> findAllByTenantIdAndStatusOrderByName(UUID tenantId, String status);
}
