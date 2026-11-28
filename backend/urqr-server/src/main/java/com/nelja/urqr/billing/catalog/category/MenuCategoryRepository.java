package com.nelja.urqr.billing.catalog.category;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface MenuCategoryRepository extends JpaRepository<MenuCategory,UUID>{List<MenuCategory> findAllByHotelIdOrderByName(String hotelId);List<MenuCategory> findAllByHotelIdAndActiveTrueOrderByName(String hotelId);List<MenuCategory> findAllByHotelIdAndIdInAndActiveTrue(String hotelId,java.util.Collection<UUID> ids);Optional<MenuCategory> findByIdAndHotelId(UUID id,String hotelId);}
