package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;    /**
     * A persisted career roadmap. Content is the JSON payload the roadmap engine
     * (or LLM) produced, kept so a user's roadmap survives restarts and the
     * dashboard can show real progress against it.
     */
    @Entity
    @Table(name = "roadmaps")
    public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(name = "role_from", nullable = false, length = 200)
    private String currentRole;

    @Column(name = "role_to", nullable = false, length = 200)
    private String targetRole;

    @Column(length = 40)
    private String timeframe;

    @Column(length = 500)
    private String focusAreas;

    /** engine (deterministic) or llm (real provider) — never "mock". */
    @Column(nullable = false, length = 16)
    private String source;

    /**
     * Plain TEXT, not a LOB: Hibernate 5.6 maps {@code @Lob String} to Postgres
     * {@code oid} large objects, which cannot be streamed through Supabase's
     * connection pooler ("Unable to access lob stream"). The roadmap JSON is a
     * few KB, so TEXT is the right type and reads cleanly over the pooler.
     */
    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCurrentRole() { return currentRole; }
    public void setCurrentRole(String currentRole) { this.currentRole = currentRole; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getTimeframe() { return timeframe; }
    public void setTimeframe(String timeframe) { this.timeframe = timeframe; }

    public String getFocusAreas() { return focusAreas; }
    public void setFocusAreas(String focusAreas) { this.focusAreas = focusAreas; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
