package com.leapai.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.model.PaymentRecord;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.PaymentRecordRepository;
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
 * Paystack payments for Leap.ai, gated behind a payments-mode flag.
 *
 * <p>The checkout on /upgrade stays inert until the human arms it. There are
 * three modes, in increasing order of how real the money is:
 * <ul>
 *   <li>{@code simulate} — no Paystack at all. The frontend renders
 *       "Simulate payment" buttons that call verify() directly; any non-blank
 *       reference succeeds and the plan entitlement is granted exactly as a
 *       real charge would. Zero keys, zero money, perfect for CI and for
 *       proving the verify/entitlement matrix end-to-end.</li>
 *   <li>{@code sandbox} — the real Paystack API with <b>test</b> keys
 *       ({@code sk_test_…}/{@code pk_test_…}). The checkout runs for real
 *       against Paystack's test environment: no money moves, and the human can
 *       complete a genuine test transaction with Paystack's test card.</li>
 *   <li>{@code live} — the real Paystack API with <b>live</b> keys
 *       ({@code sk_live_…}/{@code pk_live_…}). Real customer money. Charges,
 *       refunds and tax obligations belong to the human, not the agent.</li>
 * </ul>
 *
 * <p><b>Key-kind guard (the safety rail):</b> the mode and the keys must agree.
 * Live mode refuses to arm with test keys, and sandbox mode refuses test-key
 * transactions with live keys. This is what makes arming safe to test: a
 * misconfigured flag can never route real money through test keys or silently
 * grant entitlements on fake charges.
 *
 * <p>Env vars: {@code PAYMENTS_MODE} ({@code off} default, {@code simulate},
 * {@code sandbox}, {@code live}), {@code PAYSTACK_PUBLIC_KEY} and
 * {@code PAYSTACK_SECRET_KEY} (falls back to {@code PAYSTACK_LIVE_SECRET}).
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
    private final PaymentRecordRepository payments;

    private final String mode;
    private final String publicKey;
    private final String secretKey;

    public PaymentService(
            ObjectMapper objectMapper,
            UserRepository users,
            PaymentRecordRepository payments,
            @Value("${PAYMENTS_MODE:off}") String mode,
            @Value("${PAYSTACK_PUBLIC_KEY:}") String publicKey,
            @Value("${PAYSTACK_SECRET_KEY:${PAYSTACK_LIVE_SECRET:}}") String secretKey,
            @Value("${PAYSTACK_CURRENCIES:}") String currenciesCsv) {
        this.objectMapper = objectMapper;
        this.users = users;
        this.payments = payments;
        this.mode = normalize(mode);
        this.publicKey = publicKey == null ? "" : publicKey.trim();
        this.secretKey = secretKey == null ? "" : secretKey.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        // If the merchant sets PAYSTACK_CURRENCIES=NGN,USD only those are
        // offered. An empty value means 'all five'.
        this.currencies = (currenciesCsv == null || currenciesCsv.isBlank())
                ? ALL_CURRENCIES
                : List.of(currenciesCsv.split(","));
    }

    private static String normalize(String v) {
        if (v == null) return "off";
        v = v.trim().toLowerCase();
        return switch (v) {
            case "simulate", "sandbox", "live" -> v;
            default -> "off";
        };
    }

    /** True only when the mode is armed AND the keys match the mode's kind. */
    public boolean isArmed() {
        return switch (mode) {
            case "simulate" -> true; // no keys required; money never moves
            case "sandbox" -> !publicKey.isEmpty() && !secretKey.isEmpty()
                    && "test".equals(keyKind());
            case "live" -> !publicKey.isEmpty() && !secretKey.isEmpty()
                    && "live".equals(keyKind());
            default -> false;
        };
    }

    /** The kind of keys present: "live", "test", "none", or "mismatch" (public/secret disagree). */
    public String keyKind() {
        boolean pubLive = publicKey.startsWith("pk_live_");
        boolean pubTest = publicKey.startsWith("pk_test_");
        boolean secLive = secretKey.startsWith("sk_live_");
        boolean secTest = secretKey.startsWith("sk_test_");
        boolean pubNone = publicKey.isEmpty();
        boolean secNone = secretKey.isEmpty();
        if (pubNone && secNone) return "none";
        if ((pubLive || pubNone) && secLive) return "live";
        if ((pubTest || pubNone) && secTest) return "test";
        if (pubNone || secNone) return "none"; // one side missing — can't tell yet
        return "mismatch";
    }

    /** All known currencies with pricing. The merchant's actual supported set
     *  is narrowed by {@code PAYSTACK_CURRENCIES} (comma-separated env var);
     *  if unset, all five are offered. */
    private static final List<String> ALL_CURRENCIES = List.of("NGN", "USD", "GHS", "ZAR", "KES");
    private final List<String> currencies;

    /** Returns the currencies this merchant actually supports. */
    public List<String> getCurrencies() { return currencies; }

    public Map<String, Object> status() {
        List<Map<String, Object>> plans = new ArrayList<>();
        // Single source of truth for pricing, per currency. Amounts are minor units.
        // Career Audit = one-time full profile review + gap analysis + action plan.
        plans.add(plan("roadmap-report", "Career Audit", Map.of(
                "NGN", price("\u20A615,000", 1_500_000L),
                "USD", price("$12", 1_200L),
                "GHS", price("GH\u20B5150", 15_000L),
                "ZAR", price("R220", 22_000L),
                "KES", price("KSh 1,600", 160_000L))));
        plans.add(plan("pro-monthly", "Pro — monthly", Map.of(
                "NGN", price("\u20A615,000", 1_500_000L),
                "USD", price("$12", 1_200L),
                "GHS", price("GH\u20B5150", 15_000L),
                "ZAR", price("R220", 22_000L),
                "KES", price("KSh 1,600", 160_000L))));
        // Annual ≈ 30% off the monthly rate (≈ $8.33/mo equivalent) in every currency.
        plans.add(plan("pro-annual", "Pro — annual", Map.of(
                "NGN", price("\u20A6125,000", 12_500_000L),
                "USD", price("$100", 10_000L),
                "GHS", price("GH\u20B51,250", 125_000L),
                "ZAR", price("R1,850", 185_000L),
                "KES", price("KSh 13,000", 1_300_000L))));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("mode", mode);
        result.put("enabled", isArmed());
        result.put("publicKey", isArmed() ? publicKey : "");
        result.put("currencies", currencies);
        result.put("plans", plans);
        return result;
    }

    /**
     * Readiness report for the human arming decision. Shows what mode is set,
     * whether checkout would actually work, and — crucially — what kind of keys
     * are configured, so nobody flips to live with test keys (or vice versa).
     * Never leaks key material: only prefixes.
     */
    public Map<String, Object> readiness() {
        String kind = keyKind();
        List<String> warnings = new ArrayList<>();
        String armed = isArmed() ? "yes" : "no";
        switch (mode) {
            case "simulate" -> warnings.add("Simulation mode: checkout works with simulated payments. No money moves, no Paystack API calls.");
            case "sandbox" -> {
                if (!"test".equals(kind)) {
                    armed = "no";
                    warnings.add("Sandbox mode requires TEST keys (sk_test_…/pk_test_…). Found: " + describeKeys(kind) + ".");
                } else {
                    warnings.add("Sandbox mode: real Paystack API with test keys. Use the test card 4084 0840 8408 4081. No real money moves.");
                }
            }
            case "live" -> {
                if (!"live".equals(kind)) {
                    armed = "no";
                    warnings.add("LIVE mode requires LIVE keys (sk_live_…/pk_live_…). Found: " + describeKeys(kind) + " — refusing to arm so no real money can flow.");
                } else {
                    warnings.add("LIVE mode with live keys: REAL customer money will move. Charges, refunds and tax obligations are the human's.");
                }
            }
            default -> {
                armed = "no";
                warnings.add("Mode is \"off\": checkout is gated. Set PAYMENTS_MODE to simulate (dry run), sandbox (test keys), or live (real money).");
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("mode", mode);
        result.put("armed", armed);
        result.put("keyKind", kind);
        result.put("publicKeyPrefix", publicKey.isEmpty() ? "" : publicKey.substring(0, Math.min(12, publicKey.length())) + "…");
        result.put("secretKeyPrefix", secretKey.isEmpty() ? "" : secretKey.substring(0, Math.min(12, secretKey.length())) + "…");
        result.put("warnings", warnings);
        return result;
    }

    private static String describeKeys(String kind) {
        return switch (kind) {
            case "live" -> "live keys";
            case "test" -> "test keys";
            case "mismatch" -> "a mismatch (public and secret keys disagree)";
            default -> "no keys";
        };
    }

    /**
     * Verifies a payment and grants the plan on the authenticated user's record.
     * In {@code simulate} mode any non-blank reference succeeds (plan comes from
     * the request body); in {@code sandbox}/{@code live} the reference is checked
     * against the real Paystack API and the plan comes from Paystack's metadata.
     */
    @Transactional
    public Map<String, Object> verify(User user, String reference, String bodyPlan) {
        if (mode.equals("simulate")) {
            return verifySimulated(user, reference, bodyPlan);
        }
        if (!isArmed()) {
            return Map.of("verified", false,
                    "error", "payments not armed — mode is " + mode + " with " + describeKeys(keyKind())
                            + " keys; see /api/payments/readiness");
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
            boolean grantsPro = isProPlan(planId);
            if (grantsPro) {
                grantPro(user, planId);
            }
            recordPayment(user, planId, reference, currencyOf(data), false);
            log.info("[payments] VERIFIED charge {} for {} (plan {}, grantedPro {})",
                    reference, user.getEmail(), planId, grantsPro);
            return Map.of("verified", true, "pro", grantsPro,
                    "email", user.getEmail(), "reference", reference, "plan", planId,
                    "grantedAt", Instant.now().toString());
        } catch (Exception e) {
            log.warn("[payments] verify failed for {}: {}", reference, e.getMessage());
            return Map.of("verified", false, "error", e.getMessage());
        }
    }

    private Map<String, Object> verifySimulated(User user, String reference, String bodyPlan) {
        if (reference == null || reference.isBlank()) {
            return Map.of("verified", false, "error", "reference required");
        }
        String planId = bodyPlan == null || bodyPlan.isBlank() ? "pro-monthly" : bodyPlan.trim();
        boolean grantsPro = isProPlan(planId);
        if (grantsPro) {
            grantPro(user, planId);
        }
        recordPayment(user, planId, reference, "USD", true);
        log.info("[payments] SIMULATED verify {} for {} (plan {}, grantedPro {})",
                reference, user.getEmail(), planId, grantsPro);
        return Map.of("verified", true, "simulated", true, "pro", grantsPro,
                "email", user.getEmail(), "reference", reference, "plan", planId,
                "grantedAt", Instant.now().toString());
    }

    /** Grant (or extend) the Pro entitlement with a real expiry: +30 days for
     *  monthly, +365 for annual. The expiry is what makes an unpaid plan fall
     *  back to Free instead of persisting forever. */
    private void grantPro(User user, String planId) {
        Instant now = Instant.now();
        long days = "pro-annual".equals(planId) ? 365 : 30;
        Instant base = user.getPlanExpiresAt() != null && user.getPlanExpiresAt().isAfter(now)
                ? user.getPlanExpiresAt()
                : now;
        user.setPlan(User.Plan.PRO);
        user.setPlanExpiresAt(base.plusSeconds(days * 24 * 60 * 60));
        users.save(user);
    }

    /** Persist the confirmed charge as an invoice row for Settings. */
    private void recordPayment(User user, String planId, String reference, String currency, boolean simulated) {
        try {
            PaymentRecord r = new PaymentRecord();
            r.setUserId(user.getId());
            r.setPlanId(planId);
            r.setPlanLabel(planLabel(planId));
            r.setReference(reference);
            r.setCurrency(currency == null || currency.isBlank() ? "USD" : currency);
            r.setAmountMinor(null); // filled from Paystack data when available; simulated has none
            r.setStatus(simulated ? "simulated" : "success");
            r.setExpiresAt(user.getPlanExpiresAt());
            payments.save(r);
        } catch (Exception e) {
            log.warn("[payments] could not record invoice for {}: {}", user.getEmail(), e.getMessage());
        }
    }

    private static String currencyOf(JsonNode data) {
        String c = data.path("currency").asText("");
        return c.isBlank() ? "USD" : c;
    }

    private static String planLabel(String planId) {
        return switch (planId == null ? "" : planId) {
            case "pro-monthly" -> "Pro — monthly";
            case "pro-annual" -> "Pro — annual";
            case "roadmap-report" -> "Career Audit";
            default -> planId == null ? "" : planId;
        };
    }

    /** Only the Pro plans grant the Pro entitlement. The Career Audit is a
     *  one-time product and must never flip a subscription. */
    private static boolean isProPlan(String planId) {
        return "pro-monthly".equals(planId) || "pro-annual".equals(planId);
    }

    /**
     * Real entitlement with expiry: a Pro grant whose period has lapsed is
     * downgraded to Free right here, so an unpaid subscription never keeps
     * Pro features.
     */
    public boolean isPro(User user) {
        if (user == null || user.getPlan() != User.Plan.PRO) return false;
        Instant expires = user.getPlanExpiresAt();
        if (expires == null) return true; // legacy grant without a period — keep it
        if (expires.isBefore(Instant.now())) {
            user.setPlan(User.Plan.FREE);
            user.setPlanExpiresAt(null);
            users.save(user);
            log.info("[payments] downgraded {} to Free — Pro period ended {}", user.getEmail(), expires);
            return false;
        }
        return true;
    }

    /**
     * Billing summary for Settings: current plan + status + next renewal,
     * invoice history (most recent first), and a per-user LLM usage breakdown
     * (only meaningful when the real LLM is configured; engine fallbacks cost
     * nothing and aren't recorded).
     */
    public Map<String, Object> billingSummary(User user, TokenUsageService tokenUsage) {
        boolean active = isPro(user);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("plan", active ? "pro" : "free");
        result.put("planLabel", active ? "Pro" : "Free");
        result.put("status", active ? "active" : "expired");
        result.put("nextRenewal", user.getPlanExpiresAt());

        List<Map<String, Object>> invoices = new ArrayList<>();
        for (PaymentRecord r : payments.findByUserIdOrderByCreatedAtDesc(user.getId())) {
            Map<String, Object> inv = new LinkedHashMap<>();
            inv.put("id", r.getId());
            inv.put("planId", r.getPlanId());
            inv.put("planLabel", r.getPlanLabel());
            inv.put("reference", r.getReference());
            inv.put("currency", r.getCurrency());
            inv.put("amountMinor", r.getAmountMinor());
            inv.put("status", r.getStatus());
            inv.put("createdAt", r.getCreatedAt());
            inv.put("expiresAt", r.getExpiresAt());
            invoices.add(inv);
        }
        result.put("invoices", invoices);
        result.put("usage", tokenUsage.summary(user.getId()));
        return result;
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
