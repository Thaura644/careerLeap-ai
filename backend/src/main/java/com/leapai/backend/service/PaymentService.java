package com.leapai.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Paystack payments for Leap.ai, gated behind a live-payments flag.
 *
 * <p>The checkout on /upgrade stays inert until the human explicitly arms it:
 * <ul>
 *   <li>{@code PAYMENTS_MODE} — {@code off} (default) or {@code live}. Only
 *       {@code live} arms the checkout; anything else returns it disabled.</li>
 *   <li>{@code PAYSTACK_PUBLIC_KEY} — sent to the browser for the inline popup.</li>
 *   <li>{@code PAYSTACK_SECRET_KEY} — server-side only; falls back to
 *       {@code PAYSTACK_LIVE_SECRET} for this company's existing .env.</li>
 * </ul>
 *
 * <p>Verified charges grant the plan on the user's database record — real,
 * durable entitlements, not an in-memory map.
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private static final String PAYSTACK_API = "https://api.paystack.co";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final UserRepository users;

    private final String mode;
    private final String publicKey;
    private final String secretKey;

    public PaymentService(
            ObjectMapper objectMapper,
            UserRepository users,
            @Value("${PAYMENTS_MODE:off}") String mode,
            @Value("${PAYSTACK_PUBLIC_KEY:}") String publicKey,
            @Value("${PAYSTACK_SECRET_KEY:${PAYSTACK_LIVE_SECRET:}}") String secretKey) {
        this.objectMapper = objectMapper;
        this.users = users;
        this.mode = mode == null ? "off" : mode.trim().toLowerCase();
        this.publicKey = publicKey == null ? "" : publicKey.trim();
        this.secretKey = secretKey == null ? "" : secretKey.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    /** True only when the human has armed live payments (mode=live + keys present). */
    public boolean isArmed() {
        return "live".equals(mode) && !publicKey.isEmpty() && !secretKey.isEmpty();
    }

    /** Paystack-supported currencies; amounts are in each currency's minor unit
     *  (kobo for NGN, cents for USD/ZAR/KES, pesewas for GHS). */
    static final List<String> CURRENCIES = List.of("NGN", "USD", "GHS", "ZAR", "KES");

    public Map<String, Object> status() {
        List<Map<String, Object>> plans = new ArrayList<>();
        // Single source of truth for pricing, per currency. Amounts are minor units.
        plans.add(plan("roadmap-report", "Roadmap Report", Map.of(
                "NGN", price("\u20A615,000", 1_500_000L),
                "USD", price("$12", 1_200L),
                "GHS", price("GH\u20B5150", 15_000L),
                "ZAR", price("R220", 22_000L),
                "KES", price("KSh 1,600", 160_000L))));
        plans.add(plan("pro-monthly", "Pro — monthly", Map.of(
                "NGN", price("\u20A610,000", 1_000_000L),
                "USD", price("$8", 800L),
                "GHS", price("GH\u20B5100", 10_000L),
                "ZAR", price("R145", 14_500L),
                "KES", price("KSh 1,050", 105_000L))));
        // Annual = 10 months' price (two months free) in every currency.
        plans.add(plan("pro-annual", "Pro — annual", Map.of(
                "NGN", price("\u20A6100,000", 10_000_000L),
                "USD", price("$80", 8_000L),
                "GHS", price("GH\u20B51,000", 100_000L),
                "ZAR", price("R1,450", 145_000L),
                "KES", price("KSh 10,500", 1_050_000L))));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("mode", mode);
        result.put("enabled", isArmed());
        result.put("publicKey", isArmed() ? publicKey : "");
        result.put("currencies", CURRENCIES);
        result.put("plans", plans);
        return result;
    }

    /**
     * Verifies a Paystack transaction reference server-side and grants the plan
     * on the authenticated user's record. Only runs when payments are armed.
     */
    @Transactional
    public Map<String, Object> verify(User user, String reference) {
        if (!isArmed()) {
            return Map.of("verified", false,
                    "error", "payments not armed — set PAYMENTS_MODE=live and the Paystack keys");
        }
        if (reference == null || reference.isBlank()) {
            return Map.of("verified", false, "error", "reference required");
        }
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PAYSTACK_API + "/transaction/verify/"
                            + URLEncoder.encode(reference, StandardCharsets.UTF_8)))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + secretKey)
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode node = objectMapper.readTree(response.body());
            JsonNode data = node.path("data");
            String status = data.path("status").asText("");
            if (!"success".equals(status)) {
                String shown = status.isBlank() ? "http_" + response.statusCode() : status;
                log.info("[payments] verify not-success for {}: {}", reference, shown);
                return Map.of("verified", false, "status", shown);
            }
            String planId = data.path("metadata").path("plan").asText("pro-monthly");
            // Only the Pro plans grant the Pro entitlement. The Roadmap Report is
            // a one-time product and must never flip a subscription.
            boolean grantsPro = "pro-monthly".equals(planId) || "pro-annual".equals(planId);
            if (grantsPro) {
                user.setPlan(User.Plan.PRO);
                users.save(user);
            }
            log.info("[payments] VERIFIED live charge {} for {} (plan {}, grantedPro {})",
                    reference, user.getEmail(), planId, grantsPro);
            return Map.of("verified", true, "pro", grantsPro,
                    "email", user.getEmail(), "reference", reference, "plan", planId,
                    "grantedAt", Instant.now().toString());
        } catch (Exception e) {
            log.warn("[payments] verify failed for {}: {}", reference, e.getMessage());
            return Map.of("verified", false, "error", e.getMessage());
        }
    }

    public boolean isPro(User user) {
        return user != null && user.getPlan() == User.Plan.PRO;
    }

    private static Map<String, Object> plan(String id, String label, Map<String, Map<String, Object>> prices) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("id", id);
        p.put("label", label);
        p.put("prices", prices);
        return p;
    }

    private static Map<String, Object> price(String display, long amountMinor) {
        Map<String, Object> c = new LinkedHashMap<>();
        c.put("displayPrice", display);
        c.put("amountMinor", amountMinor);
        return c;
    }
}
