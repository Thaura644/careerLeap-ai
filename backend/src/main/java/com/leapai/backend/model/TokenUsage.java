package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Table;
import java.time.Instant;

/**
 * One LLM call's token usage, per user — the raw material behind the usage
 * breakdown in Settings ("how your money/allowance is being used"). Only
 * counts calls made with the real LLM (engine fallbacks cost nothing and
 * aren't recorded).
 */
@Entity
@Table(name = "token_usage", indexes = {
        @Index(name = "idx_token_usage_user_time", columnList = "userId, createdAt")
})
public class TokenUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    /** What the call was for: chat, roadmap, flashcards, resume. */
    @Column(nullable = false, length = 40)
    private String purpose;

    @Column(length = 100)
    private String model;

    @Column(nullable = false)
    private long promptTokens;

    @Column(nullable = false)
    private long completionTokens;

    @Column(nullable = false)
    private long totalTokens;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public long getPromptTokens() { return promptTokens; }
    public void setPromptTokens(long promptTokens) { this.promptTokens = promptTokens; }

    public long getCompletionTokens() { return completionTokens; }
    public void setCompletionTokens(long completionTokens) { this.completionTokens = completionTokens; }

    public long getTotalTokens() { return totalTokens; }
    public void setTotalTokens(long totalTokens) { this.totalTokens = totalTokens; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
