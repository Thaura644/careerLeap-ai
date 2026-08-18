package com.leapai.backend.service;

import com.leapai.backend.config.JwtService;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

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

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long RESET_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService,
                       EmailService emailService,
                       @Value("${APP_BASE_URL:https://career-leap-ai.vercel.app}") String appBaseUrl) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.appBaseUrl = appBaseUrl == null || appBaseUrl.isBlank()
                ? "https://career-leap-ai.vercel.app" : appBaseUrl.replaceAll("/+$", "");
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

    public Map<String, Object> login(String email, String rawPassword) {
        User user = users.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
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
