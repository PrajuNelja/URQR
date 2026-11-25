package com.nelja.urqr.auth.security;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Login for the URQR service operator. Credentials are supplied by deployment environment variables. */
@RestController
@RequestMapping("/api/v1/platform/auth")
public class PlatformAdminAuthController {
    private final String configuredUsername;
    private final String passwordHash;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtDecoder jwtDecoder;
    private final RedisAuthStateService authState;

    public PlatformAdminAuthController(
            @Value("${app.platform-admin.username:}") String configuredUsername,
            @Value("${app.platform-admin.password:}") String configuredPassword,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtDecoder jwtDecoder,
            RedisAuthStateService authState) {
        this.configuredUsername = configuredUsername == null ? "" : configuredUsername.trim();
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtDecoder = jwtDecoder;
        this.authState = authState;
        boolean hasUsername = !this.configuredUsername.isBlank();
        boolean hasPassword = configuredPassword != null && !configuredPassword.isBlank();
        if (hasUsername != hasPassword) {
            throw new IllegalStateException("Configure both PLATFORM_ADMIN_USERNAME and PLATFORM_ADMIN_PASSWORD");
        }
        if (hasPassword && configuredPassword.length() < 8) {
            throw new IllegalStateException("PLATFORM_ADMIN_PASSWORD must be at least 8 characters");
        }
        this.passwordHash = hasPassword ? passwordEncoder.encode(configuredPassword) : "";
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        if (configuredUsername.isBlank() || passwordHash.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Platform administrator login is not configured");
        }
        String suppliedUsername = request.username().trim();
        boolean usernameMatches = java.security.MessageDigest.isEqual(
                configuredUsername.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                suppliedUsername.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        boolean passwordMatches = passwordEncoder.matches(request.password(), passwordHash);
        if (!usernameMatches || !passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid platform administrator credentials");
        }
        return new LoginResponse(jwtService.issuePlatformAdmin(configuredUsername), "Bearer",
                jwtService.expiresAt(), jwtService.issuePlatformAdminRefresh(configuredUsername),
                jwtService.refreshExpiresAt(), configuredUsername, "PLATFORM_ADMIN");
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@Valid @RequestBody RefreshRequest request) {
        Jwt refresh;
        try {
            refresh = jwtDecoder.decode(request.refreshToken());
        } catch (JwtException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }
        String subject = refresh.getSubject();
        if (!"refresh".equals(refresh.getClaimAsString("token_type"))
                || !"PLATFORM_ADMIN".equals(refresh.getClaimAsString("principal_type"))
                || subject == null || configuredUsername.isBlank()
                || !java.security.MessageDigest.isEqual(
                        configuredUsername.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                        subject.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        if (!authState.consumeRefreshToken(refresh.getId())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has already been used or revoked");
        }
        return new LoginResponse(jwtService.issuePlatformAdmin(configuredUsername), "Bearer",
                jwtService.expiresAt(), jwtService.issuePlatformAdminRefresh(configuredUsername),
                jwtService.refreshExpiresAt(), configuredUsername, "PLATFORM_ADMIN");
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record RefreshRequest(@NotBlank String refreshToken) {}
    public record LoginResponse(String accessToken, String tokenType, Instant expiresAt,
            String refreshToken, Instant refreshExpiresAt,
            String username, String role) {}
}
