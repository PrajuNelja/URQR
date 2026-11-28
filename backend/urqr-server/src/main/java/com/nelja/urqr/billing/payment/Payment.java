package com.nelja.urqr.billing.payment;
import jakarta.persistence.*; import java.math.BigDecimal; import java.time.Instant;
@Entity @Table(name="payment",uniqueConstraints=@UniqueConstraint(name="uk_payment_hotel_id",columnNames={"hotel_id","id"}),indexes={@Index(name="ix_payment_hotel_order",columnList="hotel_id,order_id"),@Index(name="ix_payment_hotel_created",columnList="hotel_id,created_at")})
public class Payment {
 @Id @Column(length=96)
 private String id;
 @Column(name = "hotel_id", nullable = false, length = 64)
 private String hotelId;
 @Column(name="order_id",nullable=false,length=96)
 private String orderId;
 @ManyToOne(fetch=FetchType.LAZY)
 @JoinColumns({@JoinColumn(name="hotel_id",referencedColumnName="hotel_id",insertable=false,updatable=false),@JoinColumn(name="order_id",referencedColumnName="id",insertable=false,updatable=false)})
 private com.nelja.urqr.billing.order.Order order;
 @Enumerated(EnumType.STRING)
 @Column(nullable=false,length=12)
 private PaymentMethod method;
 @Column(nullable=false,precision=12,scale=2)
 private BigDecimal amount;
 @Column(name="reference_no",length=120) private String referenceNo; @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt;
 protected Payment(){}
    public Payment(String id,String h,String o,PaymentMethod m,BigDecimal a,String r){this.id=id;hotelId=h;orderId=o;method=m;amount=a;referenceNo=r;createdAt=Instant.now();}
 public String getId(){return id;}
    public String getHotelId(){return hotelId;}
    public String getOrderId(){return orderId;}
    public PaymentMethod getMethod(){
     return method;
 }
    public BigDecimal getAmount(){return amount;}
    public String getReferenceNo(){return referenceNo;}
    public Instant getCreatedAt(){return createdAt;}
}
