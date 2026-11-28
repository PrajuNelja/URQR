package com.nelja.urqr.auth.audit;

import com.nelja.urqr.auth.access.user.StaffUser;
import com.nelja.urqr.auth.hotel.Hotel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "audit_record", indexes = @Index(name = "ix_audit_hotel_created", columnList = "hotel_id,created_at"))
public class AuditRecord {
    @Id
    @Column(length = 96)
    private String id;

    @Column(name = "hotel_id", nullable = false, length = 64)
    private String hotelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Hotel hotel;

    @Column(name = "user_id", length = 96)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "hotel_id", referencedColumnName = "hotel_id", insertable = false, updatable = false),
            @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    })
    private StaffUser user;

    @Column(nullable = false, length = 80)
    private String action;
    @Column(nullable = false, length = 80)
    private String entity;
    @Column(name = "entity_id", length = 80)
    private String entityId;
    @Column(name = "old_value", length = 2000)
    private String oldValue;
    @Column(name = "new_value", length = 2000)
    private String newValue;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AuditRecord() { }

    public AuditRecord(String id, String hotelId, String userId, String action, String entity,
            String entityId, String oldValue, String newValue) {
        this.id = id;
        this.hotelId = hotelId;
        this.userId = userId;
        this.action = action;
        this.entity = entity;
        this.entityId = entityId;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getHotelId() { return hotelId; }
    public String getUserId() { return userId; }
    public String getAction() { return action; }
    public String getEntity() { return entity; }
    public String getEntityId() { return entityId; }
    public String getOldValue() { return oldValue; }
    public String getNewValue() { return newValue; }
    public Instant getCreatedAt() { return createdAt; }
}
