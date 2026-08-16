package com.leapai.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;

/** Creates and validates the signed stateless auth tokens issued at login/signup. */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final String secret;
    private final long ttlSeconds;

    private Key key;

    public JwtService(@Value("${leapai.jwt.secret}") String secret,
                      @Value("${leapai.jwt.ttl-seconds}") long ttlSeconds) {
        this.secret = secret;
        this.ttlSeconds = ttlSeconds;
    }

    private static final String DEV_FALLBACK = "dev-only-change-me-in-production-0123456789abcdef";

    @PostConstruct
    void init() {
        // Fail loud when the signing key is the known dev fallback: tokens are
        // forgeable if this ships to production as-is.
        if (DEV_FALLBACK.equals(secret)) {
            log.error("JWT_SECRET is unset (using the development default). "
                    + "Set a long random JWT_SECRET environment variable before going live "
                    + "— otherwise auth tokens can be forged.");
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            log.error("JWT_SECRET is too short ({} bytes). Use at least 32 bytes of random "
                    + "entropy — short keys can be brute-forced.", secret.getBytes(StandardCharsets.UTF_8).length);
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String issue(Long userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Returns the user id (subject) if the token is valid and unexpired, else null. */
    public Long parseUserId(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody();
            return Long.valueOf(claims.getSubject());
        } catch (Exception e) {
            return null;
        }
    }
}
