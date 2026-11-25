package com.nelja.urqr.billing.order;

import com.nelja.urqr.auth.access.user.StaffUser;
import com.nelja.urqr.auth.hotel.Hotel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.FetchType;

@Entity
@Table(name = "pos_order", uniqueConstraints = {
        @UniqueConstraint(name = "uk_order_hotel_number", columnNames = {"hotel_id", "order_number"}),
        @UniqueConstraint(name = "uk_order_hotel_id", columnNames = {"hotel_id", "id"})
}, indexes = @Index(name = "ix_order_hotel_created", columnList = "hotel_id,created_at"))
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "hotel_id", nullable = false)
    private UUID hotelId;
    @Column(name = "order_number", nullable = false, length = 40)
    private String orderNumber;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Hotel hotel;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns({
            @JoinColumn(name = "hotel_id", referencedColumnName = "hotel_id", insertable = false, updatable = false),
            @JoinColumn(name = "created_by", referencedColumnName = "id", insertable = false, updatable = false)
    })
    private StaffUser creator;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.OPEN;
    @Enumerated(EnumType.STRING) @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO.setScale(2);
    @Column(name = "discount_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountTotal = BigDecimal.ZERO.setScale(2);
    @Column(name = "tax_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxTotal = BigDecimal.ZERO.setScale(2);
    @Column(name = "grand_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO.setScale(2);
    @Column(name = "created_by", nullable = false)
    private UUID createdBy;
    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Order() { }

    public Order(UUID hotelId, UUID userId, String number) {
        this.hotelId = hotelId;
        createdBy = userId;
        orderNumber = number;
        createdAt = updatedAt = Instant.now();
    }

    @PreUpdate void touch() { updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public UUID getHotelId() { return hotelId; }
    public String getOrderNumber() { return orderNumber; }
    public OrderStatus getStatus() { return status; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getDiscountTotal() { return discountTotal; }
    public BigDecimal getTaxTotal() { return taxTotal; }
    public BigDecimal getGrandTotal() { return grandTotal; }
    public UUID getCreatedBy() { return createdBy; }
    public String getCancelReason() { return cancelReason; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setTotals(BigDecimal subtotal, BigDecimal discount, BigDecimal tax, BigDecimal total) {
        this.subtotal = subtotal.setScale(2);
        discountTotal = discount.setScale(2);
        taxTotal = tax.setScale(2);
        grandTotal = total.setScale(2);
        updatedAt = Instant.now();
    }

    public void setPaymentStatus(PaymentStatus status) { paymentStatus = status; }

    public void complete() {
        if (status != OrderStatus.OPEN) throw new IllegalStateException("Only open orders can be completed");
        status = OrderStatus.COMPLETED;
        updatedAt = Instant.now();
    }

    public void cancel(String reason) {
        if (status != OrderStatus.OPEN) throw new IllegalStateException("Only open orders can be cancelled");
        if (reason == null || reason.isBlank()) throw new IllegalArgumentException("Cancellation reason is required");
        status = OrderStatus.CANCELLED;
        cancelReason = reason.trim();
        updatedAt = Instant.now();
    }
}
