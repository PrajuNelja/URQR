package com.nelja.urqr.auth.access.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffUserRepository extends JpaRepository<StaffUser, UUID> {
    Optional<StaffUser> findByHotelIdAndUsernameIgnoreCase(String hotelId, String username);
    java.util.List<StaffUser> findAllByHotelIdOrderByUsername(String hotelId);
    Optional<StaffUser> findByIdAndHotelId(UUID id, String hotelId);
    boolean existsByHotelIdAndUsernameIgnoreCase(String hotelId, String username);
    boolean existsByUsernameIgnoreCase(String username);
    long countByHotelIdAndRoleIdAndStatus(String hotelId, UUID roleId, String status);
}
