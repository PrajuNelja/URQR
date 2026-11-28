package com.nelja.urqr.billing.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nelja.urqr.auth.security.CurrentHotel;
import com.nelja.urqr.billing.payment.PaymentMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    private static final String HOTEL_ID = UUID.randomUUID().toString();
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID ORDER_ID = UUID.randomUUID();
    private static final UUID ITEM_ID = UUID.randomUUID();

    @Mock private PosOrderService service;
    @Mock private CurrentHotel tenant;

    @InjectMocks private OrderController controller;

    private Jwt jwt;
    private PosOrderService.OrderView orderView;

    @BeforeEach
    void setUp() {
        jwt = Jwt.withTokenValue("mock-jwt-token")
                .header("alg", "none")
                .claim("sub", "cashier")
                .build();

        orderView = new PosOrderService.OrderView(ORDER_ID, "ORD-2026-001", OrderStatus.OPEN,
                PaymentStatus.UNPAID, new BigDecimal("100.00"), BigDecimal.ZERO, new BigDecimal("5.00"),
                new BigDecimal("105.00"), USER_ID, null, Instant.now(), Instant.now(), UUID.randomUUID(),
                List.of(new PosOrderService.LineView(UUID.randomUUID(), ITEM_ID, "Coffee", new BigDecimal("100.00"),
                        1, BigDecimal.ZERO, new BigDecimal("2.50"), new BigDecimal("2.50"), BigDecimal.ZERO,
                        new BigDecimal("105.00"))));
    }

    @Test
    void createDelegatesToServiceWithTenantHotelAndUser() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        when(service.create(eq(HOTEL_ID), eq(USER_ID), any(), any())).thenReturn(orderView);

        OrderController.OrderRequest request = new OrderController.OrderRequest(
                List.of(new OrderController.LineRequest(ITEM_ID, 1)),
                List.of(new OrderController.PaymentRequest(PaymentMethod.CASH, new BigDecimal("105.00"), "CASH-1"))
        );

        PosOrderService.OrderView result = controller.create(jwt, request);

        assertNotNull(result);
        assertEquals(ORDER_ID, result.id());
        assertEquals("ORD-2026-001", result.orderNumber());
        verify(service).create(eq(HOTEL_ID), eq(USER_ID), any(), any());
    }

    @Test
    void getDelegatesToServiceWithTenantHotel() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(service.get(HOTEL_ID, ORDER_ID)).thenReturn(orderView);

        PosOrderService.OrderView result = controller.get(jwt, ORDER_ID);

        assertNotNull(result);
        assertEquals(ORDER_ID, result.id());
        verify(service).get(HOTEL_ID, ORDER_ID);
    }

    @Test
    void listDelegatesToServiceWithStatusAndDateRange() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        Page<PosOrderService.OrderView> page = new PageImpl<>(List.of(orderView));
        when(service.list(eq(HOTEL_ID), eq(OrderStatus.OPEN), any(), any(), any())).thenReturn(page);

        Instant from = Instant.now().minusSeconds(3600);
        Instant to = Instant.now();
        Page<PosOrderService.OrderView> result = controller.list(jwt, OrderStatus.OPEN, from, to, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(service).list(eq(HOTEL_ID), eq(OrderStatus.OPEN), eq(from), eq(to), any());
    }

    @Test
    void updateDelegatesToServiceWithTenantHotelAndUser() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        when(service.update(eq(HOTEL_ID), eq(USER_ID), eq(ORDER_ID), any())).thenReturn(orderView);

        OrderController.OrderRequest request = new OrderController.OrderRequest(
                List.of(new OrderController.LineRequest(ITEM_ID, 2))
        );

        PosOrderService.OrderView result = controller.update(jwt, ORDER_ID, request);

        assertNotNull(result);
        verify(service).update(eq(HOTEL_ID), eq(USER_ID), eq(ORDER_ID), any());
    }

    @Test
    void cancelDelegatesToServiceWithReason() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(tenant.userId(jwt)).thenReturn(USER_ID);
        when(service.cancel(HOTEL_ID, USER_ID, ORDER_ID, "Customer request")).thenReturn(orderView);

        OrderController.CancelRequest cancelRequest = new OrderController.CancelRequest("Customer request");
        PosOrderService.OrderView result = controller.cancel(jwt, ORDER_ID, cancelRequest);

        assertNotNull(result);
        verify(service).cancel(HOTEL_ID, USER_ID, ORDER_ID, "Customer request");
    }

    @Test
    void billDelegatesToService() {
        when(tenant.hotelId(jwt)).thenReturn(HOTEL_ID);
        when(service.bill(HOTEL_ID, ORDER_ID)).thenReturn(orderView);

        PosOrderService.OrderView result = controller.bill(jwt, ORDER_ID);

        assertNotNull(result);
        verify(service).bill(HOTEL_ID, ORDER_ID);
    }
}
