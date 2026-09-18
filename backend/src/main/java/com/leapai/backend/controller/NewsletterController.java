package com.leapai.backend.controller;

import com.leapai.backend.model.NewsletterSubscriber;
import com.leapai.backend.repository.NewsletterSubscriberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Public newsletter signup endpoint. No auth required.
 * Idempotent: subscribing twice with the same email returns success (not an error).
 */
@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");

    private final NewsletterSubscriberRepository repository;

    public NewsletterController(NewsletterSubscriberRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> subscribe(@RequestBody Map<String, Object> body) {
        String email = trim(body.get("email"), 200);
        String name = trim(body.get("name"), 120);
        String website = trim(body.get("website"), 200); // honeypot

        // Honeypot tripped: reply success but store nothing.
        if (!website.isEmpty()) {
            return ok();
        }

        if (email.isEmpty() || !EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Please enter a valid email address."));
        }

        // Idempotent: already subscribed = success
        if (repository.existsByEmailIgnoreCase(email)) {
            return ok();
        }

        NewsletterSubscriber sub = new NewsletterSubscriber();
        sub.setEmail(email);
        if (!name.isEmpty()) sub.setName(name);
        repository.save(sub);

        return ok();
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, Object>> unsubscribe(@RequestBody Map<String, Object> body) {
        String email = trim(body.get("email"), 200);
        if (email.isEmpty() || !EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "Please enter a valid email address."));
        }
        repository.findByEmailIgnoreCase(email).ifPresent(sub -> {
            sub.setActive(false);
            repository.save(sub);
        });
        return ok();
    }

    private static String trim(Object value, int maxLen) {
        if (value == null) return "";
        String s = String.valueOf(value).trim();
        return s.length() > maxLen ? s.substring(0, maxLen) : s;
    }

    private static ResponseEntity<Map<String, Object>> ok() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("message", "You're in — we'll send career insights, not spam.");
        return ResponseEntity.ok(res);
    }
}
