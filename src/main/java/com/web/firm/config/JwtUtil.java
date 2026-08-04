package com.web.firm.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtil {

    @Value("${spring.application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${spring.application.security.jwt.expiration}")
    private long expirationMs;

    private static final String ALGORITHM = "HmacSHA256";
    private static final String HEADER_JSON = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";

    private byte[] secretBytes;

    @PostConstruct
    public void init() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("JWT secret key is not configured");
        }
        this.secretBytes = secretKey.getBytes(StandardCharsets.UTF_8);
    }

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return generateToken(userDetails.getUsername());
    }

    /** Convenience overload: generates a fresh jti internally. */
    public String generateToken(String email) {
        return generateToken(email, java.util.UUID.randomUUID().toString());
    }

    public String generateToken(String email, String jti) {
        Instant now = Instant.now();
        Instant expiration = now.plusMillis(expirationMs);

        String payload = "{\"sub\":\"" + escapeJson(email)
                + "\",\"jti\":\"" + escapeJson(jti)
                + "\",\"iat\":" + now.getEpochSecond()
                + ",\"exp\":" + expiration.getEpochSecond() + "}";

        return buildToken(payload);
    }

    public String extractUsername(String token) {
        return extractClaim(token, "sub");
    }

    public String extractJti(String token) {
        return extractClaim(token, "jti");
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username != null
                    && username.equals(userDetails.getUsername())
                    && !isTokenExpired(token);
        } catch (Exception e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token) && verifySignature(token);
        } catch (Exception e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    private String buildToken(String payloadJson) {
        String encodedHeader = base64UrlEncode(HEADER_JSON.getBytes(StandardCharsets.UTF_8));
        String encodedPayload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signatureInput = encodedHeader + "." + encodedPayload;
        String signature = base64UrlEncode(sign(signatureInput));
        return signatureInput + "." + signature;
    }

    private boolean verifySignature(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }
        String signatureInput = parts[0] + "." + parts[1];
        String expectedSignature = base64UrlEncode(sign(signatureInput));
        return expectedSignature.equals(parts[2]);
    }

    private byte[] sign(String input) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(secretBytes, ALGORITHM));
            return mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to sign JWT", e);
        }
    }

    private boolean isTokenExpired(String token) {
        String exp = extractClaim(token, "exp");
        if (exp == null) {
            return true;
        }
        try {
            long expiration = Long.parseLong(exp);
            return Instant.now().getEpochSecond() >= expiration;
        } catch (NumberFormatException e) {
            return true;
        }
    }

    private String extractClaim(String token, String claim) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return null;
        }
        try {
            String payloadJson = new String(base64UrlDecode(parts[1]), StandardCharsets.UTF_8);
            String searchKey = "\"" + claim + "\":";
            int keyIndex = payloadJson.indexOf(searchKey);
            if (keyIndex == -1) {
                return null;
            }
            int valueStart = keyIndex + searchKey.length();
            char firstChar = payloadJson.charAt(valueStart);
            if (firstChar == '"') {
                int valueEnd = payloadJson.indexOf('"', valueStart + 1);
                return payloadJson.substring(valueStart + 1, valueEnd);
            } else {
                int valueEnd = payloadJson.indexOf(',', valueStart);
                if (valueEnd == -1) {
                    valueEnd = payloadJson.indexOf('}', valueStart);
                }
                return payloadJson.substring(valueStart, valueEnd).trim();
            }
        } catch (Exception e) {
            log.debug("Failed to extract claim from JWT: {}", e.getMessage());
            return null;
        }
    }

    private String escapeJson(String input) {
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String base64UrlEncode(byte[] input) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(input);
    }

    private byte[] base64UrlDecode(String input) {
        return Base64.getUrlDecoder().decode(input);
    }
}
