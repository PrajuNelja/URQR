package com.nelja.urqr.analytics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nelja.urqr.auth.security.CurrentHotel;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class DailySalesControllerTest {

    private static final String HOTEL_ID = UUID.randomUUID().toString();

    @Mock private DailySalesService service;
    @Mock private CurrentHotel tenant;
    @InjectMocks private DailySalesController controller;

    private Jwt jwt;

    @BeforeEach
    void setUp() {
        jwt = Jwt.withTokenValue("mock-manager-jwt")
                .header("alg", "none")
                .claim("sub", "manager-user-id")
                .claim("roles", "ROLE_MANAGER")
                .build();
    }

    @Test
    void reportDelegatesToServiceWithTenantHotelIdAndDate() {
        LocalDate date = LocalDate.of(2026, 11, 26);
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);

        DailySalesService.Report mockReport = new DailySalesService.Report(
                date,
                "INR",
                Instant.parse("2026-11-26T00:00:00Z"),
                Instant.parse("2026-11-27T00:00:00Z"),
                BigDecimal.valueOf(14500.50),
                42L
        );
        when(service.report(HOTEL_ID, date)).thenReturn(mockReport);

        DailySalesService.Report response = controller.report(jwt, date);

        assertEquals(date, response.businessDate());
        assertEquals("INR", response.currency());
        assertEquals(BigDecimal.valueOf(14500.50), response.totalPayments());
        assertEquals(42L, response.ordersWithPayments());
        verify(tenant).hotelId(jwt);
        verify(service).report(HOTEL_ID, date);
    }
}
