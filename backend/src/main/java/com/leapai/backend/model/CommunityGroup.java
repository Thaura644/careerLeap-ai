package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;

/**
 * A community discussion group — either curated (seeded, createdByUserId
 * null) or created by a real user. Member count and "last active" are never
 * read from this entity directly; CommunityService computes them from real
 * CommunityMembership/CommunityPost rows so they're never stale or fake.
 */
@Entity
@Table(name = "community_groups")
public class CommunityGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String topic;

    @Column(length = 500)
    private String description;

    /** Null for curated/seeded groups; set for user-created ones. */
    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    // Legacy seed fields — kept only so old seed data still maps cleanly;
    // no longer read when building the API response (see CommunityService).
    @Column(nullable = false)
    private int members;

    @Column(nullable = false, length = 40)
    private String lastActive;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public int getMembers() { return members; }
    public void setMembers(int members) { this.members = members; }

    public String getLastActive() { return lastActive; }
    public void setLastActive(String lastActive) { this.lastActive = lastActive; }
}
