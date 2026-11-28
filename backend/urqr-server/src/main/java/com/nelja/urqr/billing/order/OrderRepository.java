package com.nelja.urqr.billing.order;

import java.time.Instant;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, String> {

    Optional<Order> findByIdAndHotelId(String id, String hotel);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id=:id and o.hotelId=:hotel")
    Optional<Order> findForUpdate(@Param("id") String id, @Param("hotel") String hotel);

    // Explicit casts keep PostgreSQL from treating nullable filter parameters as unknown types.
    @Query(value = """
            SELECT o.* FROM pos_order o
             WHERE o.hotel_id = :hotel
               AND (CAST(:status AS varchar) IS NULL OR o.status = CAST(:status AS varchar))
               AND (CAST(:from AS timestamptz) IS NULL OR o.created_at >= CAST(:from AS timestamptz))
               AND (CAST(:to AS timestamptz) IS NULL OR o.created_at < CAST(:to AS timestamptz))
            """,
            countQuery = """
            SELECT count(*) FROM pos_order o
             WHERE o.hotel_id = :hotel
               AND (CAST(:status AS varchar) IS NULL OR o.status = CAST(:status AS varchar))
               AND (CAST(:from AS timestamptz) IS NULL OR o.created_at >= CAST(:from AS timestamptz))
               AND (CAST(:to AS timestamptz) IS NULL OR o.created_at < CAST(:to AS timestamptz))
            """,
            nativeQuery = true)
    Page<Order> search(@Param("hotel") String hotel, @Param("status") String status,
            @Param("from") Instant from, @Param("to") Instant to, Pageable pageable);

    Page<Order> findAllByHotelId(String hotel, Pageable pageable);

    long countByHotelId(String hotel);
}
