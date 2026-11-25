package com.nelja.urqr.auth.access.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffUserRepository extends JpaRepository<StaffUser, UUID> {
    List<StaffUser> findAllByUsername(String username);
    Optional<StaffUser> findByHotelIdAndUsername(UUID hotelId, String username);
    java.util.List<StaffUser> findAllByHotelIdOrderByUsername(UUID hotelId);
    Optional<StaffUser> findByIdAndHotelId(UUID id, UUID hotelId);
    boolean existsByHotelIdAndUsername(UUID hotelId, String username);
    long countByHotelIdAndRoleIdAndStatus(UUID hotelId, UUID roleId, String status);
}
