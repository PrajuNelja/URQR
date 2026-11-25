package com.nelja.urqr.auth.access.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import com.nelja.urqr.auth.access.role.Role;

@Entity
@Table(name = "staff_user", uniqueConstraints = {@UniqueConstraint(name="uk_user_hotel_username", columnNames={"hotel_id","username"}),@UniqueConstraint(name="uk_user_hotel_id",columnNames={"hotel_id","id"})},indexes=@jakarta.persistence.Index(name="ix_user_hotel_role_status",columnList="hotel_id,role_id,status"))
public class StaffUser {
    @Id
    @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;

    @Column(name = "hotel_id", nullable = false)
    private UUID hotelId;

    @Column(nullable = false, length = 160)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name="role_id", nullable=false)
    private UUID roleId;

    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumns({@JoinColumn(name="hotel_id",referencedColumnName="hotel_id",insertable=false,updatable=false),@JoinColumn(name="role_id",referencedColumnName="id",insertable=false,updatable=false)})
    private Role roleEntity;

    @Column(nullable=false, length=20)
    private String status = "ACTIVE";

    @Column(name="created_at", nullable=false, updatable=false)
    private Instant createdAt;

    protected StaffUser() { }

    public StaffUser(UUID hotelId, UUID roleId, String username, String passwordHash) {
        this.hotelId=hotelId; this.roleId=roleId; this.username=username.trim();
        this.passwordHash=passwordHash; this.status="ACTIVE"; this.createdAt=Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getHotelId() { return hotelId; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public UUID getRoleId() { return roleId; }
    public boolean isActive() { return "ACTIVE".equals(status); }
    public String getStatus() { return status; }
    public Instant getCreatedAt(){return createdAt;}
    public void setStatus(String status){this.status=status;}
    public void setRoleId(UUID roleId){this.roleId=roleId;}
    public void setPasswordHash(String passwordHash){this.passwordHash=passwordHash;}
}
