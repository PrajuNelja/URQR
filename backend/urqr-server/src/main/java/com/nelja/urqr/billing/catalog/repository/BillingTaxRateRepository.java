package com.nelja.urqr.billing.catalog.repository;

import com.nelja.urqr.billing.catalog.entity.BillingTaxRate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingTaxRateRepository extends JpaRepository<BillingTaxRate, UUID> {
    List<BillingTaxRate> findAllByTenantIdOrderByCode(UUID tenantId);
}
