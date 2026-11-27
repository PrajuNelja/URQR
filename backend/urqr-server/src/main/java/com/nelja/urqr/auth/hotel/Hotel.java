package com.nelja.urqr.auth.hotel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.ZoneId;
import java.time.LocalTime;
import java.util.Currency;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import jakarta.persistence.PrePersist;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "hotel")
public class Hotel {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 3)
    private String currencyCode;

    @Column(nullable = false, length = 64)
    private String timezone;

    @Column(nullable = false)
    private LocalTime dayCutoff;

    @Column(nullable = false, length = 24)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "receipt_details", columnDefinition = "jsonb")
    private Map<String, Object> receiptDetails = new HashMap<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Hotel() { }

    public static Hotel create(String id, String name, String currencyCode, String timezone, LocalTime dayCutoff,
            Map<String, Object> receiptDetails) {
        return new Hotel(id, name, currencyCode, timezone, dayCutoff, receiptDetails);
    }

    private Hotel(String id, String name, String currencyCode, String timezone, LocalTime dayCutoff,
            Map<String, Object> receiptDetails) {
        this.id = requireText(id, "id");
        if (this.id.length() > 64) throw new IllegalArgumentException("Hotel id must be at most 64 characters");
        this.name = requireText(name, "name");
        this.currencyCode = Currency.getInstance(requireText(currencyCode, "currencyCode")).getCurrencyCode();
        this.timezone = ZoneId.of(requireText(timezone, "timezone")).getId();
        this.dayCutoff = dayCutoff;
        this.status = "ACTIVE";
        this.receiptDetails = receiptDetails == null ? new HashMap<>() : new HashMap<>(receiptDetails);
    }

    @PrePersist void onCreate() { if (createdAt == null) createdAt = Instant.now(); }

    public void update(String name, String currencyCode, String timezone, LocalTime dayCutoff,
            Map<String, Object> receiptDetails) {
        this.name = requireText(name, "name");
        this.currencyCode = Currency.getInstance(requireText(currencyCode, "currencyCode")).getCurrencyCode();
        this.timezone = ZoneId.of(requireText(timezone, "timezone")).getId();
        this.dayCutoff = dayCutoff;
        if (receiptDetails != null) this.receiptDetails = new HashMap<>(receiptDetails);
    }
    public void setStatus(String status) { this.status = status; }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(field + " is required");
        return value.trim();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCurrencyCode() { return currencyCode; }
    public String getTimezone() { return timezone; }
    public LocalTime getDayCutoff() { return dayCutoff; }
    public String getStatus() { return status; }
    public Map<String, Object> getReceiptDetails() {
        return receiptDetails == null ? Map.of()
                : Collections.unmodifiableMap(new HashMap<>(receiptDetails));
    }
    public Instant getCreatedAt() { return createdAt; }
}
