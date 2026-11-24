package com.nelja.urqr.platform.security;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final long REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;
    private final JwtEncoder encoder;
    private final RedisAuthStateService authState;
    private final long ttlMinutes;
    public JwtService(JwtEncoder encoder, RedisAuthStateService authState,
            @Value("${app.jwt.ttl-minutes:60}") long ttlMinutes) {
        if(ttlMinutes<1||ttlMinutes>1440)throw new IllegalArgumentException("JWT_TTL_MINUTES must be from 1 to 1440");
        this.encoder=encoder; this.authState=authState; this.ttlMinutes=ttlMinutes;
    }
    public String issue(StaffPrincipal user) {
        Instant now=Instant.now();
        var claims=JwtClaimsSet.builder().id(UUID.randomUUID().toString()).issuer("urqr-server").issuedAt(now)
                .expiresAt(now.plusSeconds(ttlMinutes*60)).subject(user.username())
                .claim("token_type", "access")
                .claim("uid",user.staffId().toString()).claim("hotel_id",user.hotelId().toString())
                .claim("roles", List.of(user.role())).build();
        return encode(claims);
    }
    public String issueRefresh(StaffPrincipal user) {
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder().id(UUID.randomUUID().toString()).issuer("urqr-server").issuedAt(now)
                .expiresAt(now.plusSeconds(REFRESH_TTL_SECONDS)).subject(user.username())
                .claim("token_type", "refresh")
                .claim("uid", user.staffId().toString())
                .claim("hotel_id", user.hotelId().toString())
                .claim("roles", List.of(user.role())).build();
        return encode(claims);
    }
    public String issuePlatformAdmin(String username) {
        Instant now=Instant.now();
        var claims=JwtClaimsSet.builder().id(UUID.randomUUID().toString()).issuer("urqr-server").issuedAt(now)
                .expiresAt(now.plusSeconds(ttlMinutes*60)).subject(username)
                .claim("token_type", "access")
                .claim("principal_type", "PLATFORM_ADMIN")
                .claim("roles", List.of("PLATFORM_ADMIN")).build();
        return encode(claims);
    }
    public String issuePlatformAdminRefresh(String username) {
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder().id(UUID.randomUUID().toString()).issuer("urqr-server").issuedAt(now)
                .expiresAt(now.plusSeconds(REFRESH_TTL_SECONDS)).subject(username)
                .claim("token_type", "refresh")
                .claim("principal_type", "PLATFORM_ADMIN")
                .claim("roles", List.of("PLATFORM_ADMIN")).build();
        return encode(claims);
    }
    private String encode(JwtClaimsSet claims) {
        JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256).build();
        var token = encoder.encode(JwtEncoderParameters.from(header, claims));
        String tokenType = (String) claims.getClaims().get("token_type");
        String hotelClaim = (String) claims.getClaims().get("hotel_id");
        String userClaim = (String) claims.getClaims().get("uid");
        authState.registerToken(token.getId(), tokenType, claims.getExpiresAt(),
                hotelClaim == null ? null : UUID.fromString(hotelClaim),
                userClaim == null ? null : UUID.fromString(userClaim));
        return token.getTokenValue();
    }
    public Instant expiresAt(){return Instant.now().plusSeconds(ttlMinutes*60);}
    public Instant refreshExpiresAt(){return Instant.now().plusSeconds(REFRESH_TTL_SECONDS);}
}
