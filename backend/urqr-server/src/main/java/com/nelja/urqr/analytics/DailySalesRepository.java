package com.nelja.urqr.analytics;
import java.math.BigDecimal;import java.time.Instant;import org.springframework.data.jpa.repository.Query;import org.springframework.data.repository.Repository;import org.springframework.data.repository.query.Param;
public interface DailySalesRepository extends Repository<com.nelja.urqr.billing.payment.Payment,String>{
 @Query("select coalesce(sum(p.amount),0) from Payment p where p.hotelId=:hotel and p.createdAt>=:startAt and p.createdAt<:endAt") BigDecimal paid(@Param("hotel")String h,@Param("startAt")Instant from,@Param("endAt")Instant to);
 @Query("select count(distinct p.orderId) from Payment p where p.hotelId=:hotel and p.createdAt>=:startAt and p.createdAt<:endAt") long paidOrders(@Param("hotel")String h,@Param("startAt")Instant from,@Param("endAt")Instant to);
}
