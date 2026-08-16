package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * A real-world practice scenario — a case study, build project, interview
 * prep track, or exam prep track. Unlike the LeetCode-style problems (judged
 * against hidden tests), scenarios are guided practice: a curated scenario
 * brief with a step-by-step plan the user works through, marking steps done.
 *
 * <p>Every scenario is either a <em>trial</em> (free users get one taste per
 * category) or Pro-only (full access). The gate is enforced server-side.
 */
@Entity
@Table(name = "practice_scenarios")
public class PracticeScenario {

    public enum Type { CASE_STUDY, PROJECT, INTERVIEW_PREP, EXAM_PREP }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private Type type;

    @Column(nullable = false, length = 40)
    private String difficulty;

    @Column(nullable = false, length = 120)
    private String category;

    @Column(nullable = false, length = 60)
    private String estMinutes;

    /** Short card blurb shown in lists. */
    @Column(nullable = false, length = 500)
    private String summary;

    /** The full scenario brief. */
    @Column(nullable = false, columnDefinition = "text")
    private String description;

    /** JSON array of steps: [{"title": "...", "detail": "..."}, ...] */
    @Column(nullable = false, columnDefinition = "text")
    private String stepsJson;

    /** Trial = included in the free tier (one per category); Pro = full access. */
    @Column(nullable = false)
    private boolean trial;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getEstMinutes() { return estMinutes; }
    public void setEstMinutes(String estMinutes) { this.estMinutes = estMinutes; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStepsJson() { return stepsJson; }
    public void setStepsJson(String stepsJson) { this.stepsJson = stepsJson; }

    public boolean isTrial() { return trial; }
    public void setTrial(boolean trial) { this.trial = trial; }
}
