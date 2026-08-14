package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.PaymentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /** Reports whether payments are armed and the plans the frontend should render. */
    @GetMapping("/status")
    public Map<String, Object> status() {
        return new LinkedHashMap<>(paymentService.status());
    }

    /** Server-side verification of a Paystack reference; grants the plan on the user's record. */
    @PostMapping("/verify")
    public Map<String, Object> verify(@RequestBody Map<String, Object> body) {
        String reference = String.valueOf(body.getOrDefault("reference", ""));
        return new LinkedHashMap<>(paymentService.verify(UserContext.require(), reference));
    }

    /** Whether the authenticated user holds a Pro grant (persisted on their record). */
    @GetMapping("/me")
    public Map<String, Object> me() {
        return Map.of("pro", paymentService.isPro(UserContext.require()));
    }
}
