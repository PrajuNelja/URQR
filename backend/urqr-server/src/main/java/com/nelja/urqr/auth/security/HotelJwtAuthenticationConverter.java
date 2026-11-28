package com.nelja.urqr.auth.security;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class HotelJwtAuthenticationConverter implements Converter<Jwt, JwtAuthenticationToken> {
    private final RedisAuthStateService authState;
    private final String platformAdminUsername;

    public HotelJwtAuthenticationConverter(RedisAuthStateService authState,
            @Value("${app.platform-admin.username:}") String platformAdminUsername) {
        this.authState = authState;
        this.platformAdminUsername = platformAdminUsername;
    }

    @Override
    public JwtAuthenticationToken convert(Jwt jwt) {
        try {
            if (!"access".equals(jwt.getClaimAsString("token_type"))
                    || !authState.isActiveToken(jwt.getId(), "access")) {
                throw new BadCredentialsException("Inactive or invalid access token");
            }
            if ("PLATFORM_ADMIN".equals(jwt.getClaimAsString("principal_type"))) {
                if (platformAdminUsername == null || platformAdminUsername.isBlank() || jwt.getSubject() == null
                        || !java.security.MessageDigest.isEqual(
                                platformAdminUsername.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                                jwt.getSubject().getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
                    throw new BadCredentialsException("Invalid platform administrator identity");
                }
                return new JwtAuthenticationToken(jwt,
                        List.of(new SimpleGrantedAuthority("ROLE_PLATFORM_ADMIN")), jwt.getSubject());
            }
            String hotel = jwt.getClaimAsString("hotel_id");
            if (hotel == null || hotel.isBlank() || hotel.length() > 64) {
                throw new BadCredentialsException("Missing hotel identity");
            }
            UUID userId = UUID.fromString(jwt.getClaimAsString("uid"));
            String role = authState.staffRole(hotel, userId);
            return new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority("ROLE_" + role)),
                    jwt.getSubject());
        } catch (RuntimeException exception) {
            throw new BadCredentialsException("Invalid hotel identity", exception);
        }
    }
}
