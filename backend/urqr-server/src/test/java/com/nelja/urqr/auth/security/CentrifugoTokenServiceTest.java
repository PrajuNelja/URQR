package com.nelja.urqr.auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CentrifugoTokenServiceTest {

    private static final String SECRET = "this-secret-is-at-least-thirty-two-bytes-long";
    private static final Instant NOW = Instant.parse("2026-11-27T10:00:00Z");
    private static final long TTL_SECONDS = 300;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private CentrifugoTokenService service;

    @BeforeEach
    void setUp() {
        service = new CentrifugoTokenService(objectMapper, SECRET, TTL_SECONDS,
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void signsConnectionAndSubscriptionTokensWithHmacSha256() throws Exception {
        String hotelId = UUID.fromString("4d886ed2-aa21-48cf-9694-0e75e2522043").toString();
        UUID userId = UUID.fromString("be266253-ae63-4ff0-9239-8ee6cbafde78");

        CentrifugoTokenService.TokenPair pair = service.issueOrderCredentials(hotelId, userId);
        DecodedJwt connection = decodeAndVerify(pair.connectionToken());
        DecodedJwt subscription = decodeAndVerify(pair.subscriptionToken());

        assertEquals("HS256", connection.header().get("alg"));
        assertEquals("HS256", subscription.header().get("alg"));
        assertEquals(userId.toString(), connection.claims().get("sub"));
        assertEquals(userId.toString(), subscription.claims().get("sub"));
        assertEquals(hotelId.toString(), connection.claims().get("hotel_id"));
        assertEquals(300L, ((Number) connection.claims().get("exp")).longValue()
                - ((Number) connection.claims().get("iat")).longValue());
        assertEquals(pair.expiresAt().getEpochSecond(), ((Number) subscription.claims().get("exp")).longValue());
    }

    @Test
    void subscriptionTokenIsRestrictedToOneHotelOrdersChannel() throws Exception {
        String hotelId = UUID.randomUUID().toString();
        UUID userId = UUID.randomUUID();

        CentrifugoTokenService.TokenPair pair = service.issueOrderCredentials(hotelId, userId);
        DecodedJwt subscription = decodeAndVerify(pair.subscriptionToken());

        assertEquals("orders:hotel-" + hotelId, pair.channel());
        assertEquals(pair.channel(), subscription.claims().get("channel"));
        assertFalse(subscription.claims().containsKey("channels"));
        assertFalse(subscription.claims().containsKey("allow"));
        assertTrue(subscription.claims().keySet().containsAll(java.util.Set.of("sub", "channel", "iat", "exp")));
    }

    private DecodedJwt decodeAndVerify(String token) throws Exception {
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length);
        Map<String, Object> header = objectMapper.readValue(decode(parts[0]), new TypeReference<>() { });
        Map<String, Object> claims = objectMapper.readValue(decode(parts[1]), new TypeReference<>() { });
        String signingInput = parts[0] + "." + parts[1];
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] expectedSignature = mac.doFinal(signingInput.getBytes(StandardCharsets.US_ASCII));
        byte[] actualSignature = Base64.getUrlDecoder().decode(parts[2]);
        assertTrue(java.security.MessageDigest.isEqual(expectedSignature, actualSignature));
        return new DecodedJwt(header, claims);
    }

    private static byte[] decode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }

    private record DecodedJwt(Map<String, Object> header, Map<String, Object> claims) { }
}
