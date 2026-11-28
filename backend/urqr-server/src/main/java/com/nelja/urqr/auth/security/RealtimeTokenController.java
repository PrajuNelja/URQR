package com.nelja.urqr.auth.security;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.time.Instant;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Authenticated token renewal endpoint for the POS Centrifugo connection and orders subscription. */
@RestController
@RequestMapping("/api/v1/realtime")
@SecurityRequirement(name = "bearerAuth")
public class RealtimeTokenController {

    private final CurrentHotel currentHotel;
    private final CentrifugoTokenService tokens;

    public RealtimeTokenController(CurrentHotel currentHotel, CentrifugoTokenService tokens) {
        this.currentHotel = currentHotel;
        this.tokens = tokens;
    }

    @GetMapping("/token")
    @PreAuthorize("hasAnyRole('MANAGER','CASHIER')")
    public RealtimeTokenResponse renew(@AuthenticationPrincipal Jwt jwt) {
        String hotelId = currentHotel.hotelId(jwt);
        String userId = currentHotel.userId(jwt);
        CentrifugoTokenService.TokenPair pair = tokens.issueOrderCredentials(hotelId, userId);
        return new RealtimeTokenResponse(pair.connectionToken(), pair.subscriptionToken(), pair.channel(),
                pair.expiresAt());
    }

    public record RealtimeTokenResponse(String connectionToken, String subscriptionToken,
            String channel, Instant expiresAt) { }
}
