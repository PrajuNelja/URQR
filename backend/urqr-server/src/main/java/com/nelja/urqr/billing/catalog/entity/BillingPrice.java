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
@Table(name = "prices", uniqueConstraints = {
        @UniqueConstraint(name = "uq_prices_tenant_id", columnNames = {"tenant_id", "id"})
})
public class BillingPrice extends BaseTenantEntity {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "product_id", nullable = false)
    private UUID productId;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    @Column(nullable = false, length = 3)
    private String currency;
    @Column(name = "is_active", nullable = false)
    private boolean active;

    protected BillingPrice() { }

    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public boolean isActive() { return active; }
}
