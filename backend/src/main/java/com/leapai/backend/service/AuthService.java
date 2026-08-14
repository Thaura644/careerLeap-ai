package com.leapai.backend.service;

import com.leapai.backend.config.JwtService;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return authPayload(user);
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
        u.put("plan", user.getPlan().name().toLowerCase());
        return u;
    }
}
