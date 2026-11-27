package com.nelja.urqr.auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nelja.urqr.auth.access.role.Role;
import com.nelja.urqr.auth.access.role.RoleRepository;
import com.nelja.urqr.auth.access.user.StaffUser;
import com.nelja.urqr.auth.access.user.StaffUserRepository;
import com.nelja.urqr.auth.hotel.Hotel;
import com.nelja.urqr.auth.hotel.HotelRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private static final UUID HOTEL_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID ROLE_ID = UUID.randomUUID();

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private HotelRepository hotels;
    @Mock private StaffUserRepository users;
    @Mock private RoleRepository roles;
    @Mock private JwtDecoder jwtDecoder;
    @Mock private RedisAuthStateService authState;
    @Mock private HotelRlsContext rls;

    @InjectMocks private AuthController controller;

    private Hotel activeHotel;
    private StaffUser staffUser;
    private Role managerRole;

    @BeforeEach
    void setUp() {
        activeHotel = mock(Hotel.class);
        lenient().when(activeHotel.getId()).thenReturn(HOTEL_ID);
        lenient().when(activeHotel.getStatus()).thenReturn("ACTIVE");

        staffUser = mock(StaffUser.class);
        managerRole = mock(Role.class);
    }

    @Test
    void loginSuccessfulReturnsTokensAndProfileForManager() {
        String username = "manager@example.test";
        String password = "Password@123";

        when(hotels.findAll()).thenReturn(List.of(activeHotel));
        when(users.findByHotelIdAndUsernameIgnoreCase(HOTEL_ID, username)).thenReturn(Optional.of(staffUser));

        StaffPrincipal principal = new StaffPrincipal(USER_ID, HOTEL_ID, username, password, "MANAGER", true);
        Authentication authenticated = new UsernamePasswordAuthenticationToken(principal, password);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authenticated);

        when(jwtService.issue(principal)).thenReturn("access-token-123");
        when(jwtService.issueRefresh(principal)).thenReturn("refresh-token-123");
        Instant accessExpiry = Instant.now().plusSeconds(900);
        Instant refreshExpiry = Instant.now().plusSeconds(604800);
        when(jwtService.expiresAt()).thenReturn(accessExpiry);
        when(jwtService.refreshExpiresAt()).thenReturn(refreshExpiry);

        AuthController.LoginResponse response = controller.login(new AuthController.LoginRequest(username, password));

        assertNotNull(response);
        assertEquals("access-token-123", response.accessToken());
        assertEquals("refresh-token-123", response.refreshToken());
        assertEquals("MANAGER", response.role());
        assertEquals(HOTEL_ID, response.hotelId());
        assertEquals(USER_ID, response.userId());
        verify(rls).bindTenant(HOTEL_ID);
    }

    @Test
    void loginCashierDoesNotReceiveRefreshToken() {
        String username = "cashier@example.test";
        String password = "Password@123";

        when(hotels.findAll()).thenReturn(List.of(activeHotel));
        when(users.findByHotelIdAndUsernameIgnoreCase(HOTEL_ID, username)).thenReturn(Optional.of(staffUser));

        StaffPrincipal principal = new StaffPrincipal(USER_ID, HOTEL_ID, username, password, "CASHIER", true);
        Authentication authenticated = new UsernamePasswordAuthenticationToken(principal, password);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authenticated);

        when(jwtService.issue(principal)).thenReturn("cashier-access-token");
        when(jwtService.expiresAt()).thenReturn(Instant.now().plusSeconds(900));

        AuthController.LoginResponse response = controller.login(new AuthController.LoginRequest(username, password));

        assertNotNull(response);
        assertEquals("cashier-access-token", response.accessToken());
        assertNull(response.refreshToken(), "Cashiers must not be issued refresh tokens");
        assertEquals("CASHIER", response.role());
    }

    @Test
    void loginFailsWithBadCredentials() {
        String username = "unknown@example.test";
        String password = "WrongPassword";

        when(hotels.findAll()).thenReturn(List.of(activeHotel));
        when(users.findByHotelIdAndUsernameIgnoreCase(HOTEL_ID, username)).thenReturn(Optional.of(staffUser));
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.login(new AuthController.LoginRequest(username, password)));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Invalid credentials", ex.getReason());
    }

    @Test
    void refreshSucceedsForValidManagerRefreshToken() {
        String refreshTokenString = "valid-refresh-token";
        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaimAsString("token_type")).thenReturn("refresh");
        when(jwt.getClaimAsString("principal_type")).thenReturn(null);
        when(jwt.getClaimAsString("hotel_id")).thenReturn(HOTEL_ID.toString());
        when(jwt.getClaimAsString("uid")).thenReturn(USER_ID.toString());
        when(jwt.getSubject()).thenReturn("manager@example.test");
        when(jwt.getId()).thenReturn("token-jti-123");

        when(jwtDecoder.decode(refreshTokenString)).thenReturn(jwt);
        when(hotels.findByIdAndStatus(HOTEL_ID, "ACTIVE")).thenReturn(Optional.of(activeHotel));

        when(staffUser.isActive()).thenReturn(true);
        when(staffUser.getUsername()).thenReturn("manager@example.test");
        when(staffUser.getRoleId()).thenReturn(ROLE_ID);
        when(staffUser.getId()).thenReturn(USER_ID);
        when(staffUser.getHotelId()).thenReturn(HOTEL_ID);
        when(users.findByIdAndHotelId(USER_ID, HOTEL_ID)).thenReturn(Optional.of(staffUser));

        when(managerRole.getName()).thenReturn("MANAGER");
        when(roles.findByIdAndHotelId(ROLE_ID, HOTEL_ID)).thenReturn(Optional.of(managerRole));

        when(authState.consumeRefreshToken("token-jti-123")).thenReturn(true);

        when(jwtService.issue(any(StaffPrincipal.class))).thenReturn("new-access-token");
        when(jwtService.issueRefresh(any(StaffPrincipal.class))).thenReturn("new-refresh-token");
        when(jwtService.expiresAt()).thenReturn(Instant.now().plusSeconds(900));
        when(jwtService.refreshExpiresAt()).thenReturn(Instant.now().plusSeconds(604800));

        AuthController.LoginResponse response = controller.refresh(new AuthController.RefreshRequest(refreshTokenString));

        assertNotNull(response);
        assertEquals("new-access-token", response.accessToken());
        assertEquals("new-refresh-token", response.refreshToken());
        verify(authState).consumeRefreshToken("token-jti-123");
    }

    @Test
    void refreshRejectsRevokedOrReusedToken() {
        String refreshTokenString = "reused-refresh-token";
        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaimAsString("token_type")).thenReturn("refresh");
        when(jwt.getClaimAsString("principal_type")).thenReturn(null);
        when(jwt.getClaimAsString("hotel_id")).thenReturn(HOTEL_ID.toString());
        when(jwt.getClaimAsString("uid")).thenReturn(USER_ID.toString());
        when(jwt.getSubject()).thenReturn("manager@example.test");
        when(jwt.getId()).thenReturn("token-reused-id");

        when(jwtDecoder.decode(refreshTokenString)).thenReturn(jwt);
        when(hotels.findByIdAndStatus(HOTEL_ID, "ACTIVE")).thenReturn(Optional.of(activeHotel));

        when(staffUser.isActive()).thenReturn(true);
        when(staffUser.getUsername()).thenReturn("manager@example.test");
        when(staffUser.getRoleId()).thenReturn(ROLE_ID);
        when(users.findByIdAndHotelId(USER_ID, HOTEL_ID)).thenReturn(Optional.of(staffUser));

        when(managerRole.getName()).thenReturn("MANAGER");
        when(roles.findByIdAndHotelId(ROLE_ID, HOTEL_ID)).thenReturn(Optional.of(managerRole));

        // Atomic replay prevention: Redis returns false
        when(authState.consumeRefreshToken("token-reused-id")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.refresh(new AuthController.RefreshRequest(refreshTokenString)));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Refresh token has already been used or revoked", ex.getReason());
    }

    @Test
    void refreshRejectsMalformedToken() {
        when(jwtDecoder.decode("malformed")).thenThrow(new JwtException("Malformed JWT"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.refresh(new AuthController.RefreshRequest("malformed")));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }
}
