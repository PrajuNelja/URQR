package com.nelja.urqr.order;
import jakarta.persistence.*; import java.math.BigDecimal; import java.util.UUID;
@Entity @Table(name="order_item",indexes={@Index(name="ix_order_item_hotel_order",columnList="hotel_id,order_id")})
public class OrderItem {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id; @Column(name="hotel_id",nullable=false) private UUID hotelId; @Column(name="order_id",nullable=false) private UUID orderId; @Column(name="menu_item_id",nullable=false) private UUID menuItemId;
 @Column(name="name_snapshot",nullable=false,length=160) private String nameSnapshot; @Column(name="price_snapshot",nullable=false,precision=12,scale=2) private BigDecimal priceSnapshot; @Column(nullable=false) private int quantity; @Column(name="line_total",nullable=false,precision=12,scale=2) private BigDecimal lineTotal;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumns({@JoinColumn(name="hotel_id",referencedColumnName="hotel_id",insertable=false,updatable=false),@JoinColumn(name="order_id",referencedColumnName="id",insertable=false,updatable=false)}) private Order order;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumns({@JoinColumn(name="hotel_id",referencedColumnName="hotel_id",insertable=false,updatable=false),@JoinColumn(name="menu_item_id",referencedColumnName="id",insertable=false,updatable=false)}) private com.nelja.urqr.menu.item.MenuItem menuItem;
 protected OrderItem(){} public OrderItem(UUID h,UUID o,UUID menuId,String name,BigDecimal price,int qty){hotelId=h;orderId=o;menuItemId=menuId;nameSnapshot=name;priceSnapshot=price;setQuantity(qty);}
 public UUID getId(){return id;} public UUID getHotelId(){return hotelId;} public UUID getOrderId(){return orderId;} public UUID getMenuItemId(){return menuItemId;} public String getNameSnapshot(){return nameSnapshot;} public BigDecimal getPriceSnapshot(){return priceSnapshot;} public int getQuantity(){return quantity;} public BigDecimal getLineTotal(){return lineTotal;}
 public void setQuantity(int q){if(q<1||q>999)throw new IllegalArgumentException("Quantity must be between 1 and 999");quantity=q;lineTotal=priceSnapshot.multiply(BigDecimal.valueOf(q)).setScale(2);}
}
