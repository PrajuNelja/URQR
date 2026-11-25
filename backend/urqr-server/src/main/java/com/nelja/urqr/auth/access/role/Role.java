package com.nelja.urqr.auth.access.role;

import jakarta.persistence.*;
import java.util.UUID;
import com.nelja.urqr.auth.hotel.Hotel;

@Entity
@Table(name="hotel_role", uniqueConstraints={@UniqueConstraint(name="uk_role_hotel_name", columnNames={"hotel_id","name"}),@UniqueConstraint(name="uk_role_hotel_id",columnNames={"hotel_id","id"})})
public class Role {
    @Id
    @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;
    @Column(name="hotel_id", nullable=false)
    private UUID hotelId;
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="hotel_id",referencedColumnName="id",insertable=false,updatable=false)
    private Hotel hotel;
    @Column(nullable=false, length=50)
    private String name;
    protected Role() { }
    public Role(UUID hotelId, String name) {
        this.hotelId=hotelId;
        rename(name); }
    public UUID getId(){return id;}
    public UUID getHotelId(){return hotelId;}
    public String getName(){return name;}
    public void rename(String name){
        if(name==null||name.isBlank()||name.length()>50)
            throw new IllegalArgumentException("Role name is required and must be at most 50 characters");
        this.name=name.trim().toUpperCase();
    }
}
