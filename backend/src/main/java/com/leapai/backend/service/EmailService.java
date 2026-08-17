package com.leapai.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Transactional email for Leap.ai (password reset, and future notifications).
 *
 * <p><b>Primary: Gmail SMTP.</b> Uses the app password from
 * {@code SMTP_USERNAME} / {@code SMTP_PASSWORD} (smtp.gmail.com:587, STARTTLS).
 * No verified sending domain is required, so it works immediately.
 *
 * <p><b>Fallback: Resend API</b> ({@code RESEND_API_KEY}). Used only when SMTP
 * is not configured or the send throws — so email keeps working even if one
 * provider hiccups. Resend requires a verified sending domain; if none is set
 * the send fails loudly rather than pretending to succeed.
 *
 * <p>Never fabricated: a send either reaches the provider (and returns true)
 * or throws, and the caller reports the honest result to the UI.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String smtpFrom;
    private final String resendApiKey;
    private final HttpClient httpClient;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${MAIL_FROM:jamesmweni52@gmail.com}") String smtpFrom,
            @Value("${RESEND_API_KEY:}") String resendApiKey) {
        this.mailSender = mailSender;
        this.smtpFrom = smtpFrom == null || smtpFrom.isBlank() ? "jamesmweni52@gmail.com" : smtpFrom.trim();
        this.resendApiKey = resendApiKey == null ? "" : resendApiKey.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    /** True when any provider is configured (SMTP always is; Resend needs a key). */
    public boolean isConfigured() {
        return mailSender != null || !resendApiKey.isEmpty();
    }

    /**
     * Send a plain-text email. Tries Gmail SMTP first; on failure falls back to
     * Resend when a key is set. Throws with a descriptive message when nothing
     * can send, so callers never assume an email went out that didn't.
     */
    public void send(String to, String subject, String body) {
        Exception last = null;
        try {
            sendViaSmtp(to, subject, body);
            return;
        } catch (Exception e) {
            last = e;
            log.warn("[email] Gmail SMTP send to {} failed: {}", to, e.getMessage());
        }
        try {
            if (!resendApiKey.isEmpty()) {
                sendViaResend(to, subject, body);
                return;
            }
        } catch (Exception e) {
            last = e;
            log.warn("[email] Resend fallback to {} failed: {}", to, e.getMessage());
        }
        throw new IllegalStateException("Could not send email (SMTP and Resend both failed): "
                + (last == null ? "no provider configured" : last.getMessage()));
    }

    private void sendViaSmtp(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(smtpFrom);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    private void sendViaResend(String to, String subject, String body) throws Exception {
        String payload = "{\"from\":\"" + smtpFrom + "\",\"to\":[\"" + to + "\"],\"subject\":"
                + json(subject) + ",\"text\":" + json(body) + "}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .timeout(Duration.ofSeconds(20))
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();
        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Resend API returned HTTP " + response.statusCode()
                    + ": " + response.body());
        }
    }

    private static String json(String s) {
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r") + "\"";
    }
}
