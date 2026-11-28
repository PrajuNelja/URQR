package com.nelja.urqr.auth.access.role;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RoleRepository extends JpaRepository<Role,UUID> {
 Optional<Role> findByIdAndHotelId(UUID id,String hotelId);
 Optional<Role> findByHotelIdAndName(String hotelId, String name);
 List<Role> findAllByHotelIdOrderByName(String hotelId);
 boolean existsByHotelIdAndName(String hotelId,String name);
}
