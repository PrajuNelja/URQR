package com.nelja.urqr.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nelja.urqr.auth.hotel.Hotel;
import com.nelja.urqr.auth.hotel.HotelRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class DailySalesServiceTest {

    private static final String HOTEL_ID = UUID.randomUUID().toString();

    @Mock private DailySalesRepository sales;
    @Mock private HotelRepository hotels;
    @InjectMocks private DailySalesService service;

    @Test
    void reportCalculatesCorrectDayWindowAndAggregatesSales() {
        LocalDate date = LocalDate.of(2026, 11, 26);
        LocalTime cutoff = LocalTime.of(4, 0);
        String timezone = "Asia/Kolkata";

        Hotel hotel = mock(Hotel.class);
        when(hotel.getTimezone()).thenReturn(timezone);
        when(hotel.getDayCutoff()).thenReturn(cutoff);
        when(hotel.getCurrencyCode()).thenReturn("INR");
        when(hotels.findByIdAndStatus(HOTEL_ID, "ACTIVE")).thenReturn(Optional.of(hotel));

        ZoneId zone = ZoneId.of(timezone);
        ZonedDateTime start = date.atTime(cutoff).atZone(zone);
        ZonedDateTime end = start.plusDays(1);

        when(sales.paid(eq(HOTEL_ID), eq(start.toInstant()), eq(end.toInstant())))
                .thenReturn(BigDecimal.valueOf(25499.75));
        when(sales.paidOrders(eq(HOTEL_ID), eq(start.toInstant()), eq(end.toInstant())))
                .thenReturn(88L);

        DailySalesService.Report report = service.report(HOTEL_ID, date);

        assertNotNull(report);
        assertEquals(date, report.businessDate());
        assertEquals("INR", report.currency());
        assertEquals(start.toInstant(), report.startsAt());
        assertEquals(end.toInstant(), report.endsAt());
        assertEquals(BigDecimal.valueOf(25499.75), report.totalPayments());
        assertEquals(88L, report.ordersWithPayments());

        verify(hotels).findByIdAndStatus(HOTEL_ID, "ACTIVE");
        verify(sales).paid(HOTEL_ID, start.toInstant(), end.toInstant());
        verify(sales).paidOrders(HOTEL_ID, start.toInstant(), end.toInstant());
    }

    @Test
    void reportThrowsNotFoundWhenHotelDoesNotExistOrInactive() {
        LocalDate date = LocalDate.of(2026, 11, 26);
        when(hotels.findByIdAndStatus(HOTEL_ID, "ACTIVE")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.report(HOTEL_ID, date));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertEquals("Hotel not found", ex.getReason());
    }
}
