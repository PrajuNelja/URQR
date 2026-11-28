package com.nelja.urqr.auth.hotel;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelRepository extends JpaRepository<Hotel, String> {
    Optional<Hotel> findByIdAndStatus(String hotelId, String status);
}
