package com.nelja.urqr.auth.access.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

import com.nelja.urqr.auth.access.role.Role;
import com.nelja.urqr.auth.access.role.RoleRepository;
import com.nelja.urqr.auth.audit.AuditService;
import com.nelja.urqr.auth.hotel.Hotel;
import com.nelja.urqr.auth.hotel.HotelRepository;
import com.nelja.urqr.auth.security.HotelRlsContext;
import java.time.Instant;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PlatformHotelStaffControllerTest {

    private static final UUID HOTEL_ID = UUID.randomUUID();

    @Mock private HotelRepository hotels;
    @Mock private RoleRepository roles;
    @Mock private StaffUserRepository users;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private HotelRlsContext rlsContext;
    @Mock private AuditService audit;
    @Captor private ArgumentCaptor<StaffUser> userCaptor;
    @InjectMocks private PlatformHotelStaffController controller;

    @BeforeEach
    void setUp() {
        lenient().when(hotels.findByIdAndStatus(HOTEL_ID, "ACTIVE"))
                .thenReturn(Optional.of(Hotel.create(HOTEL_ID, "Test hotel", "INR", "Asia/Kolkata",
                        LocalTime.of(6, 0), null)));
    }

    @Test
    void createsSeveralManagerAndCashierAccountsForTheSameHotel() {
        UUID managerRoleId = UUID.randomUUID();
        UUID cashierRoleId = UUID.randomUUID();
        Role managerRole = mock(Role.class);
        Role cashierRole = mock(Role.class);
        when(managerRole.getId()).thenReturn(managerRoleId);
        when(cashierRole.getId()).thenReturn(cashierRoleId);
        when(roles.findByHotelIdAndName(HOTEL_ID, "MANAGER")).thenReturn(Optional.of(managerRole));
        when(roles.findByHotelIdAndName(HOTEL_ID, "CASHIER")).thenReturn(Optional.of(cashierRole));
        when(passwordEncoder.encode("ManagerPass@123")).thenReturn("hashed-manager-password");
        when(passwordEncoder.encode("CashierPass@123")).thenReturn("hashed-cashier-password");

        StaffUser managerResponse = savedUser("manager-1");
        StaffUser cashierResponse = savedUser("cashier-1");
        when(users.saveAndFlush(any(StaffUser.class))).thenReturn(managerResponse, cashierResponse);

        var manager = controller.create(HOTEL_ID, new PlatformHotelStaffController.CreatePlatformStaffUserRequest(
                " manager-1 ", "ManagerPass@123", PlatformHotelStaffController.ProvisionableStaffRole.MANAGER));
        var cashier = controller.create(HOTEL_ID, new PlatformHotelStaffController.CreatePlatformStaffUserRequest(
                "cashier-1", "CashierPass@123", PlatformHotelStaffController.ProvisionableStaffRole.CASHIER));

        assertEquals(HOTEL_ID, manager.hotelId());
        assertEquals("manager-1", manager.username());
        assertEquals("MANAGER", manager.role());
        assertEquals("cashier-1", cashier.username());
        assertEquals("CASHIER", cashier.role());
        verify(rlsContext, org.mockito.Mockito.times(2)).allowPlatformAdministration();
        verify(users, org.mockito.Mockito.times(2)).saveAndFlush(userCaptor.capture());
        assertEquals("hashed-manager-password", userCaptor.getAllValues().getFirst().getPasswordHash());
        assertEquals("hashed-cashier-password", userCaptor.getAllValues().get(1).getPasswordHash());
        verify(audit).recordSystem(HOTEL_ID, "PLATFORM_STAFF_USER_CREATED", "User",
                manager.id().toString(), "username=manager-1;role=MANAGER");
        verify(audit).recordSystem(HOTEL_ID, "PLATFORM_STAFF_USER_CREATED", "User",
                cashier.id().toString(), "username=cashier-1;role=CASHIER");
    }

    @Test
    void duplicateUsernameIsRejectedWithoutSavingAnotherAccount() {
        when(users.existsByUsernameIgnoreCase("same-name@example.test")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.create(HOTEL_ID, new PlatformHotelStaffController.CreatePlatformStaffUserRequest(
                        "same-name@example.test", "StrongPassword@123", PlatformHotelStaffController.ProvisionableStaffRole.MANAGER)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(rlsContext).allowPlatformAdministration();
        verify(users, never()).saveAndFlush(any(StaffUser.class));
    }

    @Test
    void missingHotelRoleIsReportedClearly() {
        when(roles.findByHotelIdAndName(HOTEL_ID, "CASHIER")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.create(HOTEL_ID, new PlatformHotelStaffController.CreatePlatformStaffUserRequest(
                        "cashier-2@example.test", "StrongPassword@123", PlatformHotelStaffController.ProvisionableStaffRole.CASHIER)));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(users, never()).saveAndFlush(any(StaffUser.class));
    }

    @Test
    void inactiveOrMissingHotelCannotReceiveStaffAccounts() {
        when(hotels.findByIdAndStatus(HOTEL_ID, "ACTIVE")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.create(HOTEL_ID, new PlatformHotelStaffController.CreatePlatformStaffUserRequest(
                        "manager-2@example.test", "StrongPassword@123", PlatformHotelStaffController.ProvisionableStaffRole.MANAGER)));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(rlsContext, never()).bindHotel(any());
        verify(users, never()).saveAndFlush(any(StaffUser.class));
    }

    private static StaffUser savedUser(String username) {
        StaffUser user = mock(StaffUser.class);
        when(user.getId()).thenReturn(UUID.randomUUID());
        when(user.getUsername()).thenReturn(username);
        when(user.getStatus()).thenReturn("ACTIVE");
        when(user.getCreatedAt()).thenReturn(Instant.parse("2026-01-01T00:00:00Z"));
        return user;
    }
}
