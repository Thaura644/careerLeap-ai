package com.leapai.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.leapai.backend.config.JwtService;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.io.IOException;
import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Real authentication: passwords are BCrypt-hashed, tokens are signed JWTs,
 * and the user record is the single source of truth. No demo accounts, no
 * fake sessions — a failed login returns a 401, full stop.
 */
@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final String appBaseUrl;
    private final String googleClientId;
    private final GoogleIdTokenVerifier googleVerifier;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long RESET_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService,
                       EmailService emailService,
                       @Value("${APP_BASE_URL:https://career-leap-ai.vercel.app}") String appBaseUrl,
                       @Value("${GOOGLE_CLIENT_ID:}") String googleClientId) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.appBaseUrl = appBaseUrl == null || appBaseUrl.isBlank()
                ? "https://career-leap-ai.vercel.app" : appBaseUrl.replaceAll("/+$", "");
        this.googleClientId = googleClientId == null ? "" : googleClientId.trim();
        this.googleVerifier = buildGoogleVerifier(this.googleClientId);
    }

    private static GoogleIdTokenVerifier buildGoogleVerifier(String clientId) {
        if (clientId.isEmpty()) return null; // Google sign-in stays off until a real client ID is set.
        try {
            return new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
        } catch (GeneralSecurityException | IOException e) {
            throw new IllegalStateException("Could not initialize Google ID token verifier", e);
        }
    }

    public Map<String, Object> signup(String fullName, String email, String rawPassword) {
        if (users.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with that email already exists");
        }
        User user = new User();
        user.setFullName(fullName.trim());
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setPlan(User.Plan.FREE);
        users.save(user);
        return authPayload(user);
    }

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    /**
     * Google Sign-In: verifies the ID token Google's own client-side library
     * handed the frontend (signature, issuer, audience, expiry — all via
     * {@link GoogleIdTokenVerifier}, never trusting the client's claims
     * directly). Finds the account by the verified email, or creates one.
     *
     * <p>Off by default — returns a clear error until GOOGLE_CLIENT_ID is set,
     * the same arm-before-it-works pattern as payments (see PaymentService).
     */
    public Map<String, Object> googleLogin(String idTokenString) {
        if (googleVerifier == null) {
            throw new IllegalStateException("Google sign-in isn't configured yet — GOOGLE_CLIENT_ID is unset.");
        }
        if (idTokenString == null || idTokenString.isBlank()) {
            throw new IllegalArgumentException("Missing Google ID token");
        }
        GoogleIdToken idToken;
        try {
            idToken = googleVerifier.verify(idTokenString);
        } catch (GeneralSecurityException | IOException | IllegalArgumentException e) {
            log.warn("Google ID token verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Could not verify Google sign-in — try again.");
        }
        if (idToken == null) {
            throw new IllegalArgumentException("Could not verify Google sign-in — try again.");
        }
        GoogleIdToken.Payload payload = idToken.getPayload();
        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new IllegalArgumentException("That Google account's email isn't verified.");
        }
        String email = payload.getEmail().trim().toLowerCase();
        String name = String.valueOf(payload.get("name"));

        User user = users.findByEmailIgnoreCase(email).orElseGet(() -> {
            User created = new User();
            created.setFullName(name == null || name.isBlank() || "null".equals(name) ? email : name);
            created.setEmail(email);
            // No password was ever set — a random, unusable hash keeps the
            // NOT NULL column happy without a schema change, and password
            // login correctly fails for this account (it only signs in via
            // Google, same as the account has no password to guess).
            created.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            created.setPlan(User.Plan.FREE);
            return users.save(created);
        });
        return authPayload(user);
    }

    public Map<String, Object> login(String email, String rawPassword) {
        User user = users.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        String hash = user.getPasswordHash();
        if (hash == null || hash.isBlank()) {
            log.warn("User {} has null/empty password hash — cannot login", user.getId());
            throw new IllegalArgumentException("Invalid email or password");
        }
        boolean matches;
        try {
            matches = hash.startsWith("$2") && passwordEncoder.matches(rawPassword, hash);
        } catch (Exception e) {
            // Corrupted BCrypt hash or other encoding issue — log and reject.
            log.error("Password check crashed for user {} (hash length={}): {}",
                    user.getId(), hash.length(), e.getClass().getSimpleName() + ": " + e.getMessage());
            matches = false;
        }
        if (!matches) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return authPayload(user);
    }

    /**
     * Start a password reset. Always returns the same shape whether or not the
     * email exists (no account enumeration). When the account exists, a
     * one-time, expiring reset link is emailed.
     */
    public Map<String, Object> forgotPassword(String email) {
        users.findByEmailIgnoreCase(email.trim()).ifPresent(user -> {
            String token = newToken();
            user.setResetTokenHash(sha256(token));
            user.setResetTokenExpiresAt(Instant.now().plusSeconds(RESET_TOKEN_TTL_SECONDS));
            users.save(user);
            String link = appBaseUrl + "/reset-password?token=" + token;
            String body = "Hi " + user.getFullName() + ",\n\n"
                    + "We got a request to reset your Leap.ai password. If that was you, open the "
                    + "link below to choose a new one. It expires in 1 hour.\n\n"
                    + link + "\n\n"
                    + "If you didn't request this, you can safely ignore this email — your password "
                    + "has not been changed.\n\n"
                    + "— Leap.ai";
            emailService.send(user.getEmail(), "Reset your Leap.ai password", body);
        });
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ok", true);
        result.put("message", "If that email has an account, a reset link is on its way.");
        return result;
    }

    /**
     * Complete a password reset with the one-time token from the email.
     * Validates the token (exists, not expired) before changing the password.
     */
    public Map<String, Object> resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Missing reset token");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        String hash = sha256(token.trim());
        User user = users.findByResetTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link"));
        if (user.getResetTokenExpiresAt() == null
                || user.getResetTokenExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("This reset link has expired. Please request a new one.");
        }
        // One-time use: clear the token before saving the new password.
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetTokenHash(null);
        user.setResetTokenExpiresAt(null);
        users.save(user);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ok", true);
        result.put("message", "Password updated. You can now log in.");
        return result;
    }

    public Map<String, Object> me(User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("token", jwtService.issue(user.getId(), user.getEmail()));
        payload.put("user", publicUser(user));
        return payload;
    }

    private Map<String, Object> authPayload(User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("token", jwtService.issue(user.getId(), user.getEmail()));
        payload.put("user", publicUser(user));
        return payload;
    }

    private Map<String, Object> publicUser(User user) {
        Map<String, Object> u = new LinkedHashMap<>();
        u.put("id", user.getId());
        u.put("fullName", user.getFullName());
        u.put("email", user.getEmail());
        u.put("plan", user.getPlan() != null ? user.getPlan().name().toLowerCase() : "free");
        // Career profile (drives the roadmap engine). Null-safe for new accounts.
        u.put("currentRole", nvl(user.getCurrentRole(), null));
        u.put("targetRole", nvl(user.getTargetRole(), null));
        u.put("timeframe", nvl(user.getTimeframe(), null));
        u.put("industry", nvl(user.getIndustry(), null));
        u.put("yearsExperience", nvl(user.getYearsExperience(), null));
        u.put("location", nvl(user.getLocation(), null));
        u.put("aspirations", nvl(user.getAspirations(), null));
        u.put("interests", nvl(user.getInterests(), null));
        u.put("learningFormats", nvl(user.getLearningFormats(), null));
        u.put("weeklyCommitment", nvl(user.getWeeklyCommitment(), null));
        u.put("learningStyle", nvl(user.getLearningStyle(), null));
        u.put("employmentStatus", nvl(user.getEmploymentStatus(), null));
        u.put("workMode", nvl(user.getWorkMode(), null));
        u.put("challenges", nvl(user.getChallenges(), null));
        u.put("motivation", nvl(user.getMotivation(), null));
        return u;
    }

    private static String nvl(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String newToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
