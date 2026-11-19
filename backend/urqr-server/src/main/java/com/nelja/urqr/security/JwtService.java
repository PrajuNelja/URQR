package com.nelja.urqr.security;

import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final JwtEncoder encoder;
    private final long ttlMinutes;
    public JwtService(JwtEncoder encoder, @Value("${app.jwt.ttl-minutes:60}") long ttlMinutes) {
        if(ttlMinutes<1||ttlMinutes>1440)throw new IllegalArgumentException("JWT_TTL_MINUTES must be from 1 to 1440");
        this.encoder=encoder; this.ttlMinutes=ttlMinutes;
    }
    public String issue(StaffPrincipal user) {
        Instant now=Instant.now();
        var claims=JwtClaimsSet.builder().issuer("urqr-server").issuedAt(now)
                .expiresAt(now.plusSeconds(ttlMinutes*60)).subject(user.username())
                .claim("uid",user.staffId().toString()).claim("hotel_id",user.hotelId().toString())
                .claim("roles", List.of(user.role())).build();
        return encode(claims);
    }
    public String issuePlatformAdmin(String username) {
        Instant now=Instant.now();
        var claims=JwtClaimsSet.builder().issuer("urqr-server").issuedAt(now)
                .expiresAt(now.plusSeconds(ttlMinutes*60)).subject(username)
                .claim("principal_type", "PLATFORM_ADMIN")
                .claim("roles", List.of("PLATFORM_ADMIN")).build();
        return encode(claims);
    }
    private String encode(JwtClaimsSet claims) {
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
    public Instant expiresAt(){return Instant.now().plusSeconds(ttlMinutes*60);}
}
