package com.nelja.urqr.platform.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.time.Instant;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

class RsaKeyPropertiesTest {
    @Test
    void loadsRsaKeysAndSignsAndVerifiesRs256Jwt() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        KeyPair generatedPair = generator.generateKeyPair();

        RsaKeyProperties properties = new RsaKeyProperties();
        properties.setPrivateKey(Base64.getEncoder().encodeToString(generatedPair.getPrivate().getEncoded()));
        properties.setPublicKey(Base64.getEncoder().encodeToString(generatedPair.getPublic().getEncoded()));
        KeyPair loadedPair = properties.loadKeyPair();

        assertEquals(2048, ((java.security.interfaces.RSAPublicKey) loadedPair.getPublic()).getModulus().bitLength());
        JwtConfig config = new JwtConfig();
        JwtEncoder encoder = config.jwtEncoder(loadedPair);
        JwtDecoder decoder = config.jwtDecoder(loadedPair);
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject("test-user")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(60))
                .claim("purpose", "rsa-key-test")
                .build();

        String token = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(SignatureAlgorithm.RS256).build(), claims)).getTokenValue();
        var decoded = decoder.decode(token);

        assertEquals("RS256", decoded.getHeaders().get("alg"));
        assertEquals("test-user", decoded.getSubject());
        assertEquals("rsa-key-test", decoded.getClaimAsString("purpose"));

        String[] tokenParts = token.split("\\.");
        assertEquals(3, tokenParts.length);
        char firstSignatureCharacter = tokenParts[2].charAt(0);
        tokenParts[2] = (firstSignatureCharacter == 'A' ? "B" : "A") + tokenParts[2].substring(1);
        assertThrows(JwtException.class, () -> decoder.decode(String.join(".", tokenParts)));
        assertNotNull(loadedPair.getPrivate());
    }

    @Test
    void rejectsMissingRsaKeySecrets() {
        assertThrows(IllegalStateException.class, () -> new RsaKeyProperties().loadKeyPair());
    }
}
