package com.nelja.urqr.billing.catalog.category;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface MenuCategoryRepository extends JpaRepository<MenuCategory,String>{List<MenuCategory> findAllByHotelIdOrderByName(String hotelId);List<MenuCategory> findAllByHotelIdAndActiveTrueOrderByName(String hotelId);List<MenuCategory> findAllByHotelIdAndIdInAndActiveTrue(String hotelId,java.util.Collection<String> ids);Optional<MenuCategory> findByIdAndHotelId(String id,String hotelId);}
