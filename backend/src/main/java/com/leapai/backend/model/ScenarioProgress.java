package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;

/**
 * Per-user progress through a practice scenario: which steps are done, kept
 * as a JSON array of step indexes. Persisted, so a user's place survives
 * restarts and is scoped to the real account.
 */
@Entity
@Table(name = "scenario_progress")
public class ScenarioProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 80)
    private String scenarioSlug;

    /** JSON array of completed step indexes, e.g. [0, 2, 3]. */
    @Column(nullable = false, columnDefinition = "text")
    private String completedStepsJson = "[]";

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getScenarioSlug() { return scenarioSlug; }
    public void setScenarioSlug(String scenarioSlug) { this.scenarioSlug = scenarioSlug; }

    public String getCompletedStepsJson() { return completedStepsJson; }
    public void setCompletedStepsJson(String completedStepsJson) { this.completedStepsJson = completedStepsJson; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
