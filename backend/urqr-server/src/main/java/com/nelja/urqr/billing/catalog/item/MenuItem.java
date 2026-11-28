package com.nelja.urqr.billing.catalog.item;
import jakarta.persistence.*; import java.math.BigDecimal; import java.util.UUID;import com.nelja.urqr.billing.catalog.category.MenuCategory;
@Entity @Table(name="menu_item",uniqueConstraints=@UniqueConstraint(name="uk_item_hotel_id",columnNames={"hotel_id","id"}),indexes={@Index(name="ix_item_hotel_available",columnList="hotel_id,available"),@Index(name="ix_item_hotel_category",columnList="hotel_id,category_id")})
public class MenuItem {
 @Id
 @GeneratedValue(strategy=GenerationType.UUID)
 private UUID id; @Column(name = "hotel_id", nullable = false, length = 64) private String hotelId;
 @Column(name="category_id",nullable=false)
 private UUID categoryId;
 @Column(nullable=false,length=160)
 private String name;
 @Column(nullable=false,precision=12,scale=2)
 private BigDecimal price; @Column(nullable=false)
    private boolean available=true;
 @Column(nullable=false)
 private boolean active=true;
 @Column(name="cgst_rate",nullable=false,precision=5,scale=2) private BigDecimal cgstRate=BigDecimal.ZERO;
 @Column(name="sgst_rate",nullable=false,precision=5,scale=2) private BigDecimal sgstRate=BigDecimal.ZERO;
 @Column(name="vat_rate",nullable=false,precision=5,scale=2) private BigDecimal vatRate=BigDecimal.ZERO;
 @Column(name="discount_percent",nullable=false,precision=5,scale=2) private BigDecimal discountPercent=BigDecimal.ZERO;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumns({@JoinColumn(name="hotel_id",referencedColumnName="hotel_id",insertable=false,updatable=false),@JoinColumn(name="category_id",referencedColumnName="id",insertable=false,updatable=false)}) private MenuCategory category;
 protected MenuItem(){} public MenuItem(String h,UUID c,String n,BigDecimal p){hotelId=h;categoryId=c;update(c,n,p);}
 public UUID getId(){return id;} public String getHotelId(){return hotelId;} public UUID getCategoryId(){return categoryId;} public String getCategoryName(){return category==null?null:category.getName();} public String getName(){return name;} public BigDecimal getPrice(){return price;} public boolean isAvailable(){return available&&active;}
 public BigDecimal getCgstRate(){return cgstRate;} public BigDecimal getSgstRate(){return sgstRate;} public BigDecimal getVatRate(){return vatRate;} public BigDecimal getDiscountPercent(){return discountPercent;}
 public void update(UUID c,String n,BigDecimal p){update(c,n,p,cgstRate,sgstRate,vatRate,discountPercent);}
 public void update(UUID c,String n,BigDecimal p,BigDecimal cgst,BigDecimal sgst,BigDecimal vat,BigDecimal discount){if(n==null||n.isBlank()||n.length()>160)throw new IllegalArgumentException("Item name is required");if(p==null||p.signum()<0||p.scale()>2||p.precision()>12)throw new IllegalArgumentException("Price must be non-negative with at most two decimal places");categoryId=c;name=n.trim();price=p.setScale(2);cgstRate=rate(cgst,"CGST");sgstRate=rate(sgst,"SGST");vatRate=rate(vat,"VAT");discountPercent=rate(discount,"Discount");}
 private static BigDecimal rate(BigDecimal value,String field){if(value==null)value=BigDecimal.ZERO;if(value.signum()<0||value.compareTo(new BigDecimal("100"))>0||value.scale()>2)throw new IllegalArgumentException(field+" must be between 0 and 100 with at most two decimal places");return value.setScale(2);}
 public void setAvailable(boolean v){available=v;} public void deactivate(){active=false;available=false;}
}
