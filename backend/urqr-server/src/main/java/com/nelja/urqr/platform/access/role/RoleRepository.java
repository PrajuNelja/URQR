package com.nelja.urqr.platform.access.role;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RoleRepository extends JpaRepository<Role,UUID> {
 Optional<Role> findByIdAndHotelId(UUID id,UUID hotelId);
 List<Role> findAllByHotelIdOrderByName(UUID hotelId);
 boolean existsByHotelIdAndName(UUID hotelId,String name);
}
