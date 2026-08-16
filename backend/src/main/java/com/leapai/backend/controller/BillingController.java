package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.PaymentService;
import com.leapai.backend.service.TokenUsageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Billing + usage for the signed-in user: current plan and its status, the
 * renewal schedule, invoice history, and a per-user LLM token breakdown.
 * Everything is scoped to the authenticated user — no one else's data.
 */
@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final PaymentService payments;
    private final TokenUsageService tokenUsage;

    public BillingController(PaymentService payments, TokenUsageService tokenUsage) {
        this.payments = payments;
        this.tokenUsage = tokenUsage;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return new LinkedHashMap<>(payments.billingSummary(UserContext.require(), tokenUsage));
    }
}
