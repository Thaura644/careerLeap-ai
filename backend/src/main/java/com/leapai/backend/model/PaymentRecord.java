package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;

/**
 * One confirmed payment — the user's invoice history. Written on every
 * successful (or simulated) verification so Settings can show exactly what was
 * paid, when, and what it covered. For Pro subscriptions {@code expiresAt}
 * records when the entitlement lapses if it isn't renewed.
 */
@Entity
@Table(name = "payment_records")
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    /** Plan id: pro-monthly, pro-annual, or roadmap-report. */
    @Column(nullable = false, length = 40)
    private String planId;

    @Column(nullable = false, length = 80)
    private String planLabel;

    /** Paystack transaction reference (or the simulated reference). */
    @Column(nullable = false, length = 160)
    private String reference;

    @Column(length = 12)
    private String currency;

    /** Minor units (kobo/cents), matching Paystack's convention. */
    private Long amountMinor;

    @Column(length = 20)
    private String status = "success";

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    /** When the Pro entitlement lapses (null for one-time products). */
    private Instant expiresAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public String getPlanLabel() { return planLabel; }
    public void setPlanLabel(String planLabel) { this.planLabel = planLabel; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Long getAmountMinor() { return amountMinor; }
    public void setAmountMinor(Long amountMinor) { this.amountMinor = amountMinor; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
