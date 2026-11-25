package com.nelja.urqr.billing.catalog.entity;

import com.nelja.urqr.common.persistence.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tax_rates", uniqueConstraints = {
        @UniqueConstraint(name = "uq_tax_rates_tenant_code", columnNames = {"tenant_id", "code"}),
        @UniqueConstraint(name = "uq_tax_rates_tenant_id", columnNames = {"tenant_id", "id"})
})
public class BillingTaxRate extends BaseTenantEntity {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 50)
    private String code;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(name = "rate_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal ratePercent;

    protected BillingTaxRate() { }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public BigDecimal getRatePercent() { return ratePercent; }
}
