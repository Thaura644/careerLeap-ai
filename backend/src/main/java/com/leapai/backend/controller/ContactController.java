package com.leapai.backend.controller;

import com.leapai.backend.model.ContactMessage;
import com.leapai.backend.repository.ContactMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Public contact form endpoint. No auth required — anyone can reach the team.
 * Messages are persisted so they can actually be read (never silently dropped).
 */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");

    private final ContactMessageRepository repository;

    public ContactController(ContactMessageRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@RequestBody Map<String, Object> body) {
        String name = trim(body.get("name"), 120);
        String email = trim(body.get("email"), 200);
        String subject = trim(body.get("subject"), 200);
        String message = trim(body.get("message"), 5000);
        String website = trim(body.get("website"), 200); // honeypot — bots fill it in

        // Honeypot tripped: reply success but store nothing.
        if (!website.isEmpty()) {
            return ok();
        }

        String error = validate(name, email, subject, message);
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", error));
        }

        ContactMessage m = new ContactMessage();
        m.setName(name);
        m.setEmail(email);
        m.setSubject(subject);
        m.setMessage(message);
        repository.save(m);

        return ok();
    }

    private static String validate(String name, String email, String subject, String message) {
        if (name.length() < 2) return "Please tell us your name.";
        if (email.isEmpty() || !EMAIL_PATTERN.matcher(email).matches())
            return "Please enter a valid email address.";
        if (subject.length() < 3) return "Please add a short subject.";
        if (message.length() < 10) return "Please write a message (at least a few words).";
        return null;
    }

    private static String trim(Object value, int maxLen) {
        if (value == null) return "";
        String s = String.valueOf(value).trim();
        return s.length() > maxLen ? s.substring(0, maxLen) : s;
    }

    private static ResponseEntity<Map<String, Object>> ok() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("message", "Message received — we'll get back to you.");
        return ResponseEntity.ok(res);
    }
}
