package com.nelja.urqr.menu.item;
import jakarta.persistence.*; import java.math.BigDecimal; import java.util.UUID;import com.nelja.urqr.menu.category.MenuCategory;
@Entity @Table(name="menu_item",uniqueConstraints=@UniqueConstraint(name="uk_item_hotel_id",columnNames={"hotel_id","id"}),indexes={@Index(name="ix_item_hotel_available",columnList="hotel_id,available"),@Index(name="ix_item_hotel_category",columnList="hotel_id,category_id")})
public class MenuItem {
 @Id
 @GeneratedValue(strategy=GenerationType.UUID)
 private UUID id; @Column(name="hotel_id",nullable=false) private UUID hotelId;
 @Column(name="category_id",nullable=false)
 private UUID categoryId;
 @Column(nullable=false,length=160)
 private String name;
 @Column(nullable=false,precision=12,scale=2)
 private BigDecimal price; @Column(nullable=false)
    private boolean available=true;
 @Column(nullable=false)
 private boolean active=true;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumns({@JoinColumn(name="hotel_id",referencedColumnName="hotel_id",insertable=false,updatable=false),@JoinColumn(name="category_id",referencedColumnName="id",insertable=false,updatable=false)}) private MenuCategory category;
 protected MenuItem(){} public MenuItem(UUID h,UUID c,String n,BigDecimal p){hotelId=h;categoryId=c;update(c,n,p);}
 public UUID getId(){return id;} public UUID getHotelId(){return hotelId;} public UUID getCategoryId(){return categoryId;} public String getName(){return name;} public BigDecimal getPrice(){return price;} public boolean isAvailable(){return available&&active;}
 public void update(UUID c,String n,BigDecimal p){if(n==null||n.isBlank()||n.length()>160)throw new IllegalArgumentException("Item name is required");if(p==null||p.signum()<0||p.scale()>2||p.precision()>12)throw new IllegalArgumentException("Price must be non-negative with at most two decimal places");categoryId=c;name=n.trim();price=p.setScale(2);}
 public void setAvailable(boolean v){available=v;} public void deactivate(){active=false;available=false;}
}
