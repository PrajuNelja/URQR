package com.nelja.urqr.auth.security;

import com.nelja.urqr.auth.access.user.StaffUserRepository;
import com.nelja.urqr.auth.access.role.RoleRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import com.nelja.urqr.auth.hotel.HotelRepository;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final HotelRepository hotels;
    private final StaffUserRepository users;
    private final RoleRepository roles;
    private final JwtDecoder jwtDecoder;
    private final RedisAuthStateService authState;
    private final HotelRlsContext rls;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
            HotelRepository hotels, StaffUserRepository users, RoleRepository roles, JwtDecoder jwtDecoder,
            RedisAuthStateService authState, HotelRlsContext rls) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.hotels = hotels;
        this.users = users;
        this.roles = roles;
        this.jwtDecoder = jwtDecoder;
        this.authState = authState;
        this.rls = rls;
    }

    @PostMapping("/login")
    @Transactional(readOnly = true)
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        // Email login identifiers are case-insensitive; normalize consistently with staff creation.
        String username = request.username().trim().toLowerCase(java.util.Locale.ROOT);
        List<StaffPrincipal> matchingAccounts = new ArrayList<>();

        // User accounts are protected by RLS, so probe each hotel in its own RLS context.
        for (var hotel : hotels.findAll()) {
            if (!"ACTIVE".equals(hotel.getStatus())) continue;
            rls.bindHotel(hotel.getId());
            var account = users.findByHotelIdAndUsernameIgnoreCase(hotel.getId(), username);
            if (account.isEmpty()) continue;
            String principal = hotel.getId() + ":" + username;
            try {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(principal, request.password()));
                StaffPrincipal staff = (StaffPrincipal) authentication.getPrincipal();
                matchingAccounts.add(staff);
            } catch (AuthenticationException ignored) {
                // A username can exist in multiple hotels; check each account without revealing which matched.
            }
        }

        if (matchingAccounts.size() != 1) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        StaffPrincipal staff = matchingAccounts.get(0);
        String token = jwtService.issue(staff);
        boolean isManager = "MANAGER".equalsIgnoreCase(staff.role());
        String refreshToken = isManager ? jwtService.issueRefresh(staff) : null;
        return new LoginResponse(token, "Bearer", jwtService.expiresAt(), refreshToken,
                isManager ? jwtService.refreshExpiresAt() : null, staff.staffId(),
                staff.hotelId(), staff.username(), staff.role());
    }

    @PostMapping("/refresh")
    @Transactional
    public LoginResponse refresh(@Valid @RequestBody RefreshRequest request) {
        Jwt refresh;
        try {
            refresh = jwtDecoder.decode(request.refreshToken());
        } catch (JwtException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }
        if (!"refresh".equals(refresh.getClaimAsString("token_type"))
                || refresh.getClaimAsString("principal_type") != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        try {
            UUID hotelId = UUID.fromString(refresh.getClaimAsString("hotel_id"));
            UUID userId = UUID.fromString(refresh.getClaimAsString("uid"));
            rls.bindHotel(hotelId);
            var hotel = hotels.findByIdAndStatus(hotelId, "ACTIVE");
            var user = users.findByIdAndHotelId(userId, hotelId).filter(account -> account.isActive());
            if (hotel.isEmpty() || user.isEmpty() || !user.get().getUsername().equals(refresh.getSubject())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
            }
            var role = roles.findByIdAndHotelId(user.get().getRoleId(), hotelId);
            if (role.isEmpty() || !"MANAGER".equalsIgnoreCase(role.get().getName())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
            }
            if (!authState.consumeRefreshToken(refresh.getId())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has already been used or revoked");
            }
            StaffPrincipal staff = StaffPrincipal.from(user.get(), role.get().getName());
            return new LoginResponse(jwtService.issue(staff), "Bearer", jwtService.expiresAt(),
                    jwtService.issueRefresh(staff), jwtService.refreshExpiresAt(), staff.staffId(),
                    staff.hotelId(), staff.username(), staff.role());
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) { }
    public record RefreshRequest(@NotBlank String refreshToken) { }
    public record LoginResponse(String accessToken, String tokenType, Instant expiresAt,
            String refreshToken, Instant refreshExpiresAt,
            UUID userId, UUID hotelId, String username, String role) { }
}
