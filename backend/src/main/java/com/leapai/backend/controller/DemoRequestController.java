package com.leapai.backend.controller;

import com.leapai.backend.model.DemoRequest;
import com.leapai.backend.repository.DemoRequestRepository;
import com.leapai.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Public "Contact sales" endpoint (modal on the landing page). No auth
 * required — anyone can reach the team. Requests are persisted so they can
 * actually be read (never silently dropped), and an email notification goes
 * to the sales inbox so they're seen without checking the database.
 */
@RestController
@RequestMapping("/api/demo-requests")
public class DemoRequestController {

    private static final Logger log = LoggerFactory.getLogger(DemoRequestController.class);
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");

    private final DemoRequestRepository repository;
    private final EmailService emailService;
    /** Where contact-sales notifications land (defaults to the founder's inbox). */
    private final String salesInbox;

    public DemoRequestController(DemoRequestRepository repository,
                                 EmailService emailService,
                                 @Value("${CONTACT_SALES_EMAIL:thauram@proton.me}") String salesInbox) {
        this.repository = repository;
        this.emailService = emailService;
        this.salesInbox = salesInbox == null || salesInbox.isBlank()
                ? "thauram@proton.me" : salesInbox.trim();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@RequestBody Map<String, Object> body) {
        String name = trim(body.get("name"), 120);
        String email = trim(body.get("email"), 200);
        String companyName = trim(body.get("companyName"), 200);
        String teamSize = trim(body.get("teamSize"), 20);
        String message = trim(body.get("message"), 5000);
        String demoDate = trim(body.get("demoDate"), 40);
        String timeSlot = trim(body.get("timeSlot"), 20);
        String website = trim(body.get("website"), 200); // honeypot — bots fill it in

        // Honeypot tripped: reply success but store nothing.
        if (!website.isEmpty()) {
            return ok();
        }

        String error = validate(name, email, demoDate, timeSlot);
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", error));
        }

        DemoRequest r = new DemoRequest();
        r.setName(name);
        r.setEmail(email);
        r.setCompanyName(companyName);
        r.setTeamSize(teamSize);
        r.setMessage(message);
        r.setDemoDate(demoDate);
        r.setTimeSlot(timeSlot);
        repository.save(r);

        notifySalesInbox(r);

        return ok();
    }

    /**
     * Best-effort email push to the sales inbox. The record is already saved,
     * so a mail outage must never fail the request (the user would retry and
     * double-submit) — log loudly instead and rely on the persisted row.
     */
    private void notifySalesInbox(DemoRequest r) {
        String subject = "Leap.ai contact sales — " + r.getName()
                + (r.getCompanyName() == null || r.getCompanyName().isBlank()
                        ? "" : " (" + r.getCompanyName() + ")");
        StringBuilder body = new StringBuilder();
        body.append("New contact-sales request from the landing page.\n\n")
            .append("Name: ").append(r.getName()).append('\n')
            .append("Email: ").append(r.getEmail()).append('\n')
            .append("Company: ").append(r.getCompanyName() == null || r.getCompanyName().isBlank()
                    ? "—" : r.getCompanyName()).append('\n')
            .append("Message: ").append(r.getMessage() == null || r.getMessage().isBlank()
                    ? "—" : r.getMessage()).append('\n');
        if (r.getDemoDate() != null && !r.getDemoDate().isBlank()) {
            body.append("Requested walkthrough: ").append(r.getDemoDate())
                .append(" at ").append(r.getTimeSlot() == null || r.getTimeSlot().isBlank()
                        ? "(no time chosen)" : r.getTimeSlot()).append('\n');
        }
        try {
            emailService.send(salesInbox, subject, body.toString());
        } catch (Exception e) {
            log.error("Contact-sales notification to {} failed (request {} still persisted): {}",
                    salesInbox, r.getId(), e.getMessage());
        }
    }

    private static String validate(String name, String email, String demoDate, String timeSlot) {
        if (name.length() < 2) return "Please tell us your name.";
        if (email.isEmpty() || !EMAIL_PATTERN.matcher(email).matches())
            return "Please enter a valid email address.";
        if (demoDate.isEmpty()) return "Please choose a preferred date.";
        if (timeSlot.isEmpty()) return "Please choose a preferred time.";
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
        res.put("message", "Demo request received — we'll get back to you.");
        return ResponseEntity.ok(res);
    }
}
