package com.leapai.backend.controller;

import com.leapai.backend.service.PaymentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    /** Server-side verification of a Paystack reference; grants Pro on success. */
    @PostMapping("/verify")
    public Map<String, Object> verify(@RequestBody Map<String, Object> body) {
        String reference = String.valueOf(body.getOrDefault("reference", ""));
        String email = String.valueOf(body.getOrDefault("email", ""));
        return new LinkedHashMap<>(paymentService.verify(reference, email));
    }

    @GetMapping("/me/{email}")
    public Map<String, Object> me(@PathVariable String email) {
        return Map.of("pro", paymentService.isPro(email));
    }
}
