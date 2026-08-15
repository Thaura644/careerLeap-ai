package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;

/**
 * A spaced-repetition flashcard. Cards are generated from the user's real
 * roadmap and skills, and scheduled with an SM-2-inspired algorithm (box +
 * ease factor). "Due" is a real persisted date, never a client-side guess.
 */
@Entity
@Table(name = "flashcards")
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    /** The question / prompt shown on the front of the card. */
    @Column(nullable = false, length = 500)
    private String front;

    /** The answer / explanation shown on the back. */
    @Column(columnDefinition = "text", nullable = false)
    private String back;

    /** Topic grouping (e.g. the roadmap phase or skill it came from). */
    @Column(length = 120)
    private String topic;

    /** Leitner box 1..5 — drives how far apart reviews get. */
    @Column(nullable = false)
    private int box = 1;

    /** Current inter-review gap in days. */
    @Column(nullable = false)
    private double intervalDays = 1.0;

    /** Anki-style ease multiplier (1.3 .. 3.0). */
    @Column(nullable = false)
    private double easeFactor = 2.5;

    @Column(nullable = false)
    private Instant dueAt = Instant.now();

    @Column(nullable = false)
    private int reviewCount = 0;

    @Column(nullable = false)
    private int lapses = 0;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFront() { return front; }
    public void setFront(String front) { this.front = front; }

    public String getBack() { return back; }
    public void setBack(String back) { this.back = back; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public int getBox() { return box; }
    public void setBox(int box) { this.box = box; }

    public double getIntervalDays() { return intervalDays; }
    public void setIntervalDays(double intervalDays) { this.intervalDays = intervalDays; }

    public double getEaseFactor() { return easeFactor; }
    public void setEaseFactor(double easeFactor) { this.easeFactor = easeFactor; }

    public Instant getDueAt() { return dueAt; }
    public void setDueAt(Instant dueAt) { this.dueAt = dueAt; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public int getLapses() { return lapses; }
    public void setLapses(int lapses) { this.lapses = lapses; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
