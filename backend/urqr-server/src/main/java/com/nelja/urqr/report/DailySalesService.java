package com.nelja.urqr.report;
import com.nelja.urqr.platform.hotel.*;import java.math.BigDecimal;import java.time.*;import java.util.UUID;import org.springframework.http.HttpStatus;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import org.springframework.web.server.ResponseStatusException;
@Service public class DailySalesService{
 private final DailySalesRepository sales;private final HotelRepository hotels;public DailySalesService(DailySalesRepository s,HotelRepository h){sales=s;hotels=h;}
 @Transactional(readOnly=true) public Report report(UUID hotelId,LocalDate businessDate){Hotel h=hotels.findByIdAndStatus(hotelId,"ACTIVE").orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Hotel not found"));ZoneId zone=ZoneId.of(h.getTimezone());ZonedDateTime start=businessDate.atTime(h.getDayCutoff()).atZone(zone);ZonedDateTime end=start.plusDays(1);BigDecimal totalPayments=sales.paid(hotelId,start.toInstant(),end.toInstant());return new Report(businessDate,h.getCurrencyCode(),start.toInstant(),end.toInstant(),totalPayments,sales.paidOrders(hotelId,start.toInstant(),end.toInstant()));}
 public record Report(LocalDate businessDate,String currency,Instant startsAt,Instant endsAt,BigDecimal totalPayments,long ordersWithPayments){}
}
