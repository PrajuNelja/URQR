package com.nelja.urqr.security;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    public PlatformAdminAuthController(
            @Value("${app.platform-admin.username:}") String configuredUsername,
            @Value("${app.platform-admin.password:}") String configuredPassword,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.configuredUsername = configuredUsername == null ? "" : configuredUsername.trim();
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
                jwtService.expiresAt(), configuredUsername, "PLATFORM_ADMIN");
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record LoginResponse(String accessToken, String tokenType, Instant expiresAt,
            String username, String role) {}
}
