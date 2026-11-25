package com.nelja.urqr.auth.hotel;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelRepository extends JpaRepository<Hotel, UUID> {
    Optional<Hotel> findByIdAndStatus(UUID hotelId, String status);
}
