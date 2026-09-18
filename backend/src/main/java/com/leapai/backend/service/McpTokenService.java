package com.leapai.backend.service;

import com.leapai.backend.model.McpToken;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.McpTokenRepository;
import com.leapai.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Issues and verifies the personal access tokens that let an MCP client
 * (Claude, ChatGPT, or any other MCP-compatible AI assistant) connect to a
 * specific user's Leap.ai account. Same trust model as a GitHub/Stripe PAT:
 * shown once in plaintext at creation, only its SHA-256 hash is ever stored,
 * and it carries exactly one user's identity — never broader access.
 */
@Service
public class McpTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PREFIX = "leap_mcp_";

    private final McpTokenRepository tokens;
    private final UserRepository users;

    public McpTokenService(McpTokenRepository tokens, UserRepository users) {
        this.tokens = tokens;
        this.users = users;
    }

    /** Creates a new token for the user. Returns the plaintext once — never persisted or logged. */
    @Transactional
    public Map<String, Object> create(User user, String label) {
        byte[] raw = new byte[32];
        RANDOM.nextBytes(raw);
        String plaintext = PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(raw);

        McpToken t = new McpToken();
        t.setUserId(user.getId());
        t.setTokenHash(sha256(plaintext));
        t.setLabel(label == null || label.isBlank() ? "MCP connection" : label.trim());
        tokens.save(t);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", t.getId());
        out.put("token", plaintext); // shown exactly once
        out.put("label", t.getLabel());
        out.put("createdAt", t.getCreatedAt());
        return out;
    }

    /** Resolves a bearer token to its owning user, or empty if unknown/revoked. Updates lastUsedAt. */
    @Transactional
    public Optional<User> verify(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith(PREFIX)) return Optional.empty();
        Optional<McpToken> found = tokens.findByTokenHash(sha256(bearerToken));
        if (found.isEmpty()) return Optional.empty();
        McpToken t = found.get();
        t.setLastUsedAt(Instant.now());
        tokens.save(t);
        return users.findById(t.getUserId());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(User user) {
        return tokens.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", t.getId());
            m.put("label", t.getLabel());
            m.put("createdAt", t.getCreatedAt());
            m.put("lastUsedAt", t.getLastUsedAt());
            return m;
        }).toList();
    }

    /** Revokes a token — only if it belongs to this user. */
    @Transactional
    public boolean revoke(User user, Long tokenId) {
        return tokens.findById(tokenId)
                .filter(t -> t.getUserId().equals(user.getId()))
                .map(t -> {
                    tokens.delete(t);
                    return true;
                })
                .orElse(false);
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
