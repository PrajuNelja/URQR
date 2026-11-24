package com.nelja.urqr.platform.security;

import java.util.UUID;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Component
public class CurrentTenant {
    public UUID hotelId(Jwt jwt) { return claim(jwt,"hotel_id"); }
    public UUID userId(Jwt jwt) { return claim(jwt,"uid"); }
    public String username(Jwt jwt) { return jwt.getSubject(); }
    public String role(Jwt jwt) {
        Object roles=jwt.getClaims().get("roles");
        if(roles instanceof java.util.Collection<?> c && !c.isEmpty()) return c.iterator().next().toString();
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid identity token");
    }
    private UUID claim(Jwt jwt,String name) {
        try { return UUID.fromString(jwt.getClaimAsString(name)); }
        catch(Exception e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid identity token"); }
    }
}
