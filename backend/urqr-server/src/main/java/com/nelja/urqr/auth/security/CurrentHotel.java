package com.nelja.urqr.auth.security;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CurrentHotel {
    public UUID hotelId(Jwt jwt) { return claim(jwt, "hotel_id"); }
    public UUID userId(Jwt jwt) { return claim(jwt, "uid"); }
    public String username(Jwt jwt) { return jwt.getSubject(); }
    public String role(Jwt jwt) {
        Object roles = jwt.getClaims().get("roles");
        if (roles instanceof java.util.Collection<?> collection && !collection.isEmpty()) {
            return collection.iterator().next().toString();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid identity token");
    }
    private UUID claim(Jwt jwt, String name) {
        try {
            return UUID.fromString(jwt.getClaimAsString(name));
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid identity token");
        }
    }
}
