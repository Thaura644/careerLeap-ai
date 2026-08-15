package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;

/**
 * A Leap.ai account. The single source of truth for who a user is, what plan
 * they're on, and the profile fields the roadmap engine needs.
 */
@Entity
@Table(name = "users")
public class User {

    public enum Plan { FREE, PRO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /** BCrypt hash — never the raw password. */
    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, length = 200)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Plan plan = Plan.FREE;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // --- Career profile (used by the roadmap engine) ---
    // Columns avoid the reserved SQL words CURRENT_ROLE / TARGET_ROLE.
    @Column(name = "role_from", length = 200)
    private String currentRole;

    @Column(name = "role_to", length = 200)
    private String targetRole;

    @Column(length = 40)
    private String yearsExperience;

    @Column(length = 120)
    private String industry;

    @Column(length = 120)
    private String location;

    @Column(length = 40)
    private String timeframe;

    @Column(length = 1000)
    private String aspirations;

    /** Comma-separated skill names the user self-assessed (drives roadmap focus). */
    @Column(name = "interests", columnDefinition = "text")
    private String interests;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Plan getPlan() { return plan; }
    public void setPlan(Plan plan) { this.plan = plan; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getCurrentRole() { return currentRole; }
    public void setCurrentRole(String currentRole) { this.currentRole = currentRole; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getYearsExperience() { return yearsExperience; }
    public void setYearsExperience(String yearsExperience) { this.yearsExperience = yearsExperience; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getTimeframe() { return timeframe; }
    public void setTimeframe(String timeframe) { this.timeframe = timeframe; }

    public String getAspirations() { return aspirations; }
    public void setAspirations(String aspirations) { this.aspirations = aspirations; }

    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
}
