package com.nelja.urqr.report;
import java.math.BigDecimal;import java.time.Instant;import java.util.UUID;import org.springframework.data.jpa.repository.Query;import org.springframework.data.repository.Repository;import org.springframework.data.repository.query.Param;
public interface DailySalesRepository extends Repository<com.nelja.urqr.payment.Payment,UUID>{
 @Query("select coalesce(sum(p.amount),0) from Payment p where p.hotelId=:hotel and p.createdAt>=:startAt and p.createdAt<:endAt") BigDecimal paid(@Param("hotel")UUID h,@Param("startAt")Instant from,@Param("endAt")Instant to);
 @Query("select count(distinct p.orderId) from Payment p where p.hotelId=:hotel and p.createdAt>=:startAt and p.createdAt<:endAt") long paidOrders(@Param("hotel")UUID h,@Param("startAt")Instant from,@Param("endAt")Instant to);
}
