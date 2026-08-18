package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.CreditService;
import com.leapai.backend.service.PaymentService;
import com.leapai.backend.service.TokenUsageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Billing + usage for the signed-in user: current plan, its status, the
 * renewal schedule, invoice history, credit balance, and a per-user LLM
 * token breakdown. Everything is scoped to the authenticated user.
 */
@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final PaymentService payments;
    private final TokenUsageService tokenUsage;
    private final CreditService credits;

    public BillingController(PaymentService payments, TokenUsageService tokenUsage, CreditService credits) {
        this.payments = payments;
        this.tokenUsage = tokenUsage;
        this.credits = credits;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        var user = UserContext.require();
        Map<String, Object> result = new LinkedHashMap<>(payments.billingSummary(user, tokenUsage));
        result.put("credits", credits.status(user));
        return result;
    }
}
