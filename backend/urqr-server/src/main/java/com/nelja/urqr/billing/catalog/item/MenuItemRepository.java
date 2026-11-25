package com.nelja.urqr.billing.catalog.item;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    Optional<MenuItem> findByIdAndHotelIdAndActiveTrue(UUID id, UUID hotelId);

    List<MenuItem> findAllByHotelIdAndIdIn(UUID hotelId, Collection<UUID> ids);

    @Query("select i from MenuItem i where i.hotelId=:hotel and i.active=true "
            + "and (:category is null or i.categoryId=:category) "
            + "and exists (select c.id from MenuCategory c where c.id=i.categoryId "
            + "and c.hotelId=i.hotelId and c.active=true) order by i.name")
    List<MenuItem> findPosMenu(@Param("hotel") UUID hotel, @Param("category") UUID category);

    /** Returns every active item in every active category, including items currently unavailable for sale. */
    @Query("select i from MenuItem i join fetch i.category c "
            + "where i.hotelId=:hotel and i.active=true and c.active=true order by c.name, i.name")
    List<MenuItem> findAllActiveWithCategory(@Param("hotel") UUID hotel);
}
