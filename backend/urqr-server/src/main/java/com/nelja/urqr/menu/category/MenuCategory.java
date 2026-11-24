package com.nelja.urqr.menu.category;
import jakarta.persistence.*; import java.util.UUID;import com.nelja.urqr.platform.hotel.Hotel;
@Entity @Table(name="menu_category",uniqueConstraints={@UniqueConstraint(name="uk_category_hotel_name",columnNames={"hotel_id","name"}),@UniqueConstraint(name="uk_category_hotel_id",columnNames={"hotel_id","id"})},indexes=@Index(name="ix_category_hotel_active",columnList="hotel_id,active"))
public class MenuCategory {
 @Id @GeneratedValue(strategy=GenerationType.UUID)
 private UUID id;
 @Column(name="hotel_id",nullable=false)
 private UUID hotelId;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="hotel_id",referencedColumnName="id",insertable=false,updatable=false)
 private Hotel hotel;
 @Column(nullable=false,length=120)
 private String name;
 @Column(nullable=false)
 private boolean active=true;
 protected MenuCategory(){}
    public MenuCategory(UUID hotelId,String name){this.hotelId=hotelId;rename(name);}
 public UUID getId(){return id;} public UUID getHotelId(){return hotelId;}
    public String getName(){return name;} public boolean isActive(){return active;}
 public void rename(String name){if(name==null||name.isBlank()||name.length()>120)throw new IllegalArgumentException("Name is required and must be at most 120 characters");this.name=name.trim();}
 public void setActive(boolean active){this.active=active;}
}
