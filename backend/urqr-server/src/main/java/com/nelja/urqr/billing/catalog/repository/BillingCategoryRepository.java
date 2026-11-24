package com.nelja.urqr.billing.catalog.repository;

import com.nelja.urqr.billing.catalog.entity.BillingCategory;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingCategoryRepository extends JpaRepository<BillingCategory, UUID> {
    List<BillingCategory> findAllByTenantIdAndStatusOrderByName(UUID tenantId, String status);
}
