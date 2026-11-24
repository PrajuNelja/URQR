package com.nelja.urqr.billing.catalog.repository;

import com.nelja.urqr.billing.catalog.entity.BillingPrice;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingPriceRepository extends JpaRepository<BillingPrice, UUID> {
    List<BillingPrice> findAllByTenantIdAndProductIdInAndActiveTrue(UUID tenantId, List<UUID> productIds);
}
