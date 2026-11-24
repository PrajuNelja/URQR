package com.nelja.urqr.billing.catalog.category;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface MenuCategoryRepository extends JpaRepository<MenuCategory,UUID>{List<MenuCategory> findAllByHotelIdOrderByName(UUID hotelId);List<MenuCategory> findAllByHotelIdAndActiveTrueOrderByName(UUID hotelId);List<MenuCategory> findAllByHotelIdAndIdInAndActiveTrue(UUID hotelId,java.util.Collection<UUID> ids);Optional<MenuCategory> findByIdAndHotelId(UUID id,UUID hotelId);}
