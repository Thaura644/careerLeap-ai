package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;

/**
 * One AI-generated practice exercise, personalized to a single user's real
 * profile. Not a seeded catalog entry — type/title/prompt are all generated
 * per user by LlmService.generateCustomPractice, so a nurse and a software
 * engineer never get the same shape of exercise.
 */
@Entity
@Table(name = "custom_practice_items")
public class CustomPracticeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 60)
    private String type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String prompt;

    @Column(columnDefinition = "text")
    private String context;

    @Column(name = "expected_format", length = 300)
    private String expectedFormat;

    /** JSON array of strings — the criteria this exercise is later graded against. */
    @Column(name = "evaluation_criteria_json", nullable = false, columnDefinition = "text")
    private String evaluationCriteriaJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
    public String getExpectedFormat() { return expectedFormat; }
    public void setExpectedFormat(String expectedFormat) { this.expectedFormat = expectedFormat; }
    public String getEvaluationCriteriaJson() { return evaluationCriteriaJson; }
    public void setEvaluationCriteriaJson(String evaluationCriteriaJson) { this.evaluationCriteriaJson = evaluationCriteriaJson; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
