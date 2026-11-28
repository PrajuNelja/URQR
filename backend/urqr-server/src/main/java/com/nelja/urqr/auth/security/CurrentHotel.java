package com.nelja.urqr.auth.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CurrentHotel {
    public String hotelId(Jwt jwt) { return stringClaim(jwt, "hotel_id"); }
    public String userId(Jwt jwt) { return stringClaim(jwt, "uid"); }
    public String username(Jwt jwt) { return jwt.getSubject(); }
    public String role(Jwt jwt) {
        Object roles = jwt.getClaims().get("roles");
        if (roles instanceof java.util.Collection<?> collection && !collection.isEmpty()) {
            return collection.iterator().next().toString();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid identity token");
    }
    private static String stringClaim(Jwt jwt, String name) {
        String value = jwt.getClaimAsString(name);
        if (value == null || value.isBlank() || value.length() > 64 || value.chars().anyMatch(Character::isISOControl)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid identity token");
        }
        return value;
    }
}
