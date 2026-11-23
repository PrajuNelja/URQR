package com.nelja.urqr.sales.receipt;
import jakarta.persistence.*; import java.time.Instant; import java.util.Map; import java.util.UUID; import org.hibernate.annotations.JdbcTypeCode; import org.hibernate.type.SqlTypes;
@Entity @Table(name="receipt",uniqueConstraints=@UniqueConstraint(name="uk_receipt_hotel_number",columnNames={"hotel_id","receipt_number"}),indexes=@Index(name="ix_receipt_hotel_order",columnList="hotel_id,order_id"))
public class Receipt {
 @Id
 @GeneratedValue(strategy=GenerationType.UUID)
 private UUID id;
 @Column(name="hotel_id",nullable=false)
 private UUID hotelId;
 @Column(name="order_id",nullable=false,unique=true)
 private UUID orderId;
 @ManyToOne(fetch=FetchType.LAZY)
 @JoinColumns({@JoinColumn(name="hotel_id",referencedColumnName="hotel_id",insertable=false,updatable=false),@JoinColumn(name="order_id",referencedColumnName="id",insertable=false,updatable=false)})
 private com.nelja.urqr.sales.order.Order order;
 @Column(name="receipt_number",nullable=false,length=60)
 private String receiptNumber; @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable=false,columnDefinition="jsonb")
    private Map<String,Object> snapshot;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt;
 protected Receipt(){} public Receipt(UUID h,UUID o,String n,Map<String,Object>s){hotelId=h;orderId=o;receiptNumber=n;snapshot=Map.copyOf(s);createdAt=Instant.now();}
 public UUID getId(){return id;} public UUID getHotelId(){return hotelId;} public UUID getOrderId(){return orderId;} public String getReceiptNumber(){return receiptNumber;} public Map<String,Object> getSnapshot(){return snapshot;} public Instant getCreatedAt(){return createdAt;}
}
