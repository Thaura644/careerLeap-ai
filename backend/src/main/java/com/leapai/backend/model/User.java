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

    /** When the current Pro entitlement lapses (null = not set / one-time only).
     *  On expiry the account is downgraded to Free — an unpaid plan never stays
     *  granted. */
    private Instant planExpiresAt;

    // --- Credit-based rate limiting -------------------------------------------
    /** Monthly credit allowance (Free=300, Pro=99999). Reset on the 1st. */
    @Column
    private int creditsTotal = 300;

    /** Credits left in the current window. Deducted per AI action. */
    @Column
    private int creditsRemaining = 300;

    /** When credits last refreshed (monthly reset or 7hr partial refill). */
    @Column
    private Instant creditResetAt;

    public int getCreditsTotal() { return creditsTotal; }
    public void setCreditsTotal(int creditsTotal) { this.creditsTotal = creditsTotal; }

    public int getCreditsRemaining() { return creditsRemaining; }
    public void setCreditsRemaining(int creditsRemaining) { this.creditsRemaining = creditsRemaining; }

    public Instant getCreditResetAt() { return creditResetAt; }
    public void setCreditResetAt(Instant creditResetAt) { this.creditResetAt = creditResetAt; }

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

    /** Comma-separated preferred learning formats (e.g. "Video Courses, Podcasts"). */
    @Column(name = "learning_formats", columnDefinition = "text")
    private String learningFormats;

    /** Weekly time commitment, e.g. "3–6 hours". */
    @Column(name = "weekly_commitment", length = 40)
    private String weeklyCommitment;

    /** Learning style, e.g. "Self-paced", "Structured curriculum", "Project-driven". */
    @Column(name = "learning_style", length = 60)
    private String learningStyle;

    /** Employment status, e.g. "Employed", "Unemployed", "Student", "Freelance". */
    @Column(name = "employment_status", length = 40)
    private String employmentStatus;

    /** Preferred work setup, e.g. "Remote", "Hybrid", "On-site". */
    @Column(name = "work_mode", length = 40)
    private String workMode;

    /** Biggest career challenges (comma-separated), e.g. "Imposter syndrome, No mentorship". */
    @Column(name = "challenges", columnDefinition = "text")
    private String challenges;

    /** Why the user wants this career change / what's driving them. */
    @Column(name = "motivation", columnDefinition = "text")
    private String motivation;

    // --- Password reset (one-time token) ---
    /** SHA-256 hash of the one-time reset token (never stored raw). */
    @Column(name = "reset_token_hash", length = 64)
    private String resetTokenHash;

    /** When the reset token stops being valid. */
    @Column(name = "reset_token_expires_at")
    private Instant resetTokenExpiresAt;

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

    public Instant getPlanExpiresAt() { return planExpiresAt; }
    public void setPlanExpiresAt(Instant planExpiresAt) { this.planExpiresAt = planExpiresAt; }

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

    public String getLearningFormats() { return learningFormats; }
    public void setLearningFormats(String learningFormats) { this.learningFormats = learningFormats; }

    public String getWeeklyCommitment() { return weeklyCommitment; }
    public void setWeeklyCommitment(String weeklyCommitment) { this.weeklyCommitment = weeklyCommitment; }

    public String getLearningStyle() { return learningStyle; }
    public void setLearningStyle(String learningStyle) { this.learningStyle = learningStyle; }

    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public String getChallenges() { return challenges; }
    public void setChallenges(String challenges) { this.challenges = challenges; }

    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }

    public String getResetTokenHash() { return resetTokenHash; }
    public void setResetTokenHash(String resetTokenHash) { this.resetTokenHash = resetTokenHash; }

    public Instant getResetTokenExpiresAt() { return resetTokenExpiresAt; }
    public void setResetTokenExpiresAt(Instant resetTokenExpiresAt) { this.resetTokenExpiresAt = resetTokenExpiresAt; }
}
