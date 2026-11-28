package com.nelja.urqr.auth.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Issues Centrifugo connection and single-channel subscription JWTs signed with HS256. */
@Service
public class CentrifugoTokenService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();

    private final ObjectMapper objectMapper;
    private final String hmacSecret;
    private final Duration tokenTtl;
    private final Clock clock;

    @Autowired
    public CentrifugoTokenService(ObjectMapper objectMapper,
            @Value("${app.centrifugo.token-hmac-secret:}") String hmacSecret,
            @Value("${app.centrifugo.token-ttl-seconds:300}") long tokenTtlSeconds) {
        this(objectMapper, hmacSecret, tokenTtlSeconds, Clock.systemUTC());
    }

    CentrifugoTokenService(ObjectMapper objectMapper, String hmacSecret, long tokenTtlSeconds, Clock clock) {
        if (tokenTtlSeconds < 30 || tokenTtlSeconds > 3600) {
            throw new IllegalArgumentException("CENTRIFUGO_TOKEN_TTL_SECONDS must be from 30 to 3600");
        }
        this.objectMapper = objectMapper;
        this.hmacSecret = hmacSecret == null ? "" : hmacSecret;
        this.tokenTtl = Duration.ofSeconds(tokenTtlSeconds);
        this.clock = clock;
    }

    public TokenPair issueOrderCredentials(String hotelId, String userId) {
        if (hotelId == null || userId == null) {
            throw new IllegalArgumentException("Hotel and user IDs are required for realtime credentials");
        }
        byte[] secret = hmacSecret.getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Centrifugo token signing is not configured with a strong secret");
        }

        Instant issuedAt = clock.instant().truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
        Instant expiresAt = issuedAt.plus(tokenTtl);
        String subject = userId;
        String channel = ordersChannel(hotelId);

        Map<String, Object> connectionClaims = new LinkedHashMap<>();
        connectionClaims.put("sub", subject);
        connectionClaims.put("hotel_id", hotelId.toString());
        connectionClaims.put("iat", issuedAt.getEpochSecond());
        connectionClaims.put("exp", expiresAt.getEpochSecond());

        Map<String, Object> subscriptionClaims = new LinkedHashMap<>();
        subscriptionClaims.put("sub", subject);
        subscriptionClaims.put("channel", channel);
        subscriptionClaims.put("iat", issuedAt.getEpochSecond());
        subscriptionClaims.put("exp", expiresAt.getEpochSecond());

        return new TokenPair(sign(connectionClaims, secret), sign(subscriptionClaims, secret), channel, expiresAt);
    }

    public static String ordersChannel(String hotelId) {
        return "orders:hotel-" + hotelId;
    }

    private String sign(Map<String, Object> claims, byte[] secret) {
        try {
            String header = BASE64_URL.encodeToString(objectMapper.writeValueAsBytes(
                    Map.of("alg", "HS256", "typ", "JWT")));
            String payload = BASE64_URL.encodeToString(objectMapper.writeValueAsBytes(claims));
            String signingInput = header + "." + payload;
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            String signature = BASE64_URL.encodeToString(mac.doFinal(signingInput.getBytes(StandardCharsets.US_ASCII)));
            return signingInput + "." + signature;
        } catch (JsonProcessingException | GeneralSecurityException exception) {
            throw new IllegalStateException("Centrifugo token could not be signed", exception);
        }
    }

    public record TokenPair(String connectionToken, String subscriptionToken, String channel, Instant expiresAt) { }
}
