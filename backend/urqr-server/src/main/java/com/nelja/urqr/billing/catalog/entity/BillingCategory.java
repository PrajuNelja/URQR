package com.nelja.urqr.billing.catalog.entity;

import com.nelja.urqr.common.persistence.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.UUID;

@Entity
@Table(name = "categories", uniqueConstraints = {
        @UniqueConstraint(name = "uq_categories_tenant_name", columnNames = {"tenant_id", "name"}),
        @UniqueConstraint(name = "uq_categories_tenant_id", columnNames = {"tenant_id", "id"})
})
public class BillingCategory extends BaseTenantEntity {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "parent_id")
    private UUID parentId;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    protected BillingCategory() { }

    public BillingCategory(UUID parentId, String name) {
        this.parentId = parentId;
        this.name = name;
    }

    public UUID getId() { return id; }
    public UUID getParentId() { return parentId; }
    public String getName() { return name; }
    public String getStatus() { return status; }
}
