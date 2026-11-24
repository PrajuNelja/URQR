package com.nelja.urqr.platform.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.Signature;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Base64-encoded PKCS#8 private key and X.509 public key, supplied through
 * JWT_PRIVATE_KEY and JWT_PUBLIC_KEY environment secrets.
 */
@ConfigurationProperties(prefix = "app.jwt.rsa")
public class RsaKeyProperties {
    private String privateKey;
    private String publicKey;

    public String getPrivateKey() {
        return privateKey;
    }

    public void setPrivateKey(String privateKey) {
        this.privateKey = privateKey;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public KeyPair loadKeyPair() {
        if (privateKey == null || privateKey.isBlank() || publicKey == null || publicKey.isBlank()) {
            throw new IllegalStateException(
                    "JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must contain a matching Base64-encoded RSA key pair");
        }

        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            byte[] privateBytes = Base64.getDecoder().decode(privateKey.trim());
            byte[] publicBytes = Base64.getDecoder().decode(publicKey.trim());
            RSAPrivateKey privateKeyObject = (RSAPrivateKey) keyFactory
                    .generatePrivate(new PKCS8EncodedKeySpec(privateBytes));
            RSAPublicKey publicKeyObject = (RSAPublicKey) keyFactory
                    .generatePublic(new X509EncodedKeySpec(publicBytes));

            if (privateKeyObject.getModulus().bitLength() < 2048 || publicKeyObject.getModulus().bitLength() < 2048) {
                throw new IllegalStateException("JWT RSA keys must be at least 2048 bits");
            }
            if (!privateKeyObject.getModulus().equals(publicKeyObject.getModulus())) {
                throw new IllegalStateException("JWT_PRIVATE_KEY and JWT_PUBLIC_KEY do not form a matching key pair");
            }

            KeyPair keyPair = new KeyPair(publicKeyObject, privateKeyObject);
            verifyKeyPair(keyPair);
            return keyPair;
        } catch (IllegalStateException exception) {
            throw exception;
        } catch (IllegalArgumentException | GeneralSecurityException | ClassCastException exception) {
            throw new IllegalStateException(
                    "JWT RSA key configuration is invalid; provide matching Base64-encoded PKCS#8 and X.509 RSA keys of at least 2048 bits",
                    exception);
        }
    }

    private static void verifyKeyPair(KeyPair keyPair) throws GeneralSecurityException {
        byte[] challenge = "urqr-rsa-key-pair-check".getBytes(StandardCharsets.UTF_8);
        Signature signer = Signature.getInstance("SHA256withRSA");
        signer.initSign(keyPair.getPrivate());
        signer.update(challenge);
        byte[] signature = signer.sign();

        Signature verifier = Signature.getInstance("SHA256withRSA");
        verifier.initVerify(keyPair.getPublic());
        verifier.update(challenge);
        if (!verifier.verify(signature)) {
            throw new IllegalStateException("JWT_PRIVATE_KEY and JWT_PUBLIC_KEY do not form a matching key pair");
        }
    }
}
