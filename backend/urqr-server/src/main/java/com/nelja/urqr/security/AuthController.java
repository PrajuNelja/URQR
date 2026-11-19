package com.nelja.urqr.security;

import com.nelja.urqr.access.user.StaffUserRepository;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import com.nelja.urqr.hotel.HotelRepository;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final HotelRepository hotels;
    private final StaffUserRepository users;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
            HotelRepository hotels, StaffUserRepository users) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.hotels = hotels;
        this.users = users;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        String username = request.username().trim();
        List<StaffPrincipal> matchingAccounts = new ArrayList<>();

        for (var user : users.findAllByUsername(username)) {
            String principal = user.getHotelId() + ":" + username;
            try {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(principal, request.password()));
                StaffPrincipal staff = (StaffPrincipal) authentication.getPrincipal();
                if (hotels.findByIdAndStatus(staff.hotelId(), "ACTIVE").isPresent()) {
                    matchingAccounts.add(staff);
                }
            } catch (AuthenticationException ignored) {
                // A username can exist in multiple hotels; check each account without revealing which matched.
            }
        }

        if (matchingAccounts.size() != 1) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        StaffPrincipal staff = matchingAccounts.get(0);
        String token = jwtService.issue(staff);
        return new LoginResponse(token, "Bearer", jwtService.expiresAt(), staff.staffId(),
                staff.hotelId(), staff.username(), staff.role());
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) { }
    public record LoginResponse(String accessToken, String tokenType, Instant expiresAt,
            UUID userId, UUID hotelId, String username, String role) { }
}
