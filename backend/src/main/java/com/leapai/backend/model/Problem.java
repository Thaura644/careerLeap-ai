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
 * A coding-practice problem. Test cases are stored as JSON text so the judge
 * can run real hidden tests against the user's solution — never mocked.
 */
@Entity
@Table(name = "problems")
public class Problem {

    public enum Difficulty { EASY, MEDIUM, HARD }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Difficulty difficulty = Difficulty.EASY;

    @Column(nullable = false, length = 80)
    private String category;

    /** Human-readable problem statement (plain text / simple markdown). */
    @Column(columnDefinition = "text")
    private String description;

    /** e.g. "public static int[] twoSum(int[] nums, int target)" — shown to the user. */
    @Column(nullable = false, length = 255)
    private String signature;

    /** The exact method name the harness calls, e.g. "twoSum". */
    @Column(nullable = false, length = 100)
    private String methodName;

    /** Starting code the user edits (must compile as its own file: public class Solution). */
    @Column(columnDefinition = "text")
    private String starterCode;

    /**
     * JSON array of hidden test cases:
     * [{"args": ["new int[]{2,7,11,15}", "9"], "expected": "[0, 1]"}, ...]
     * args are Java-literal expressions, expected is the canonical string form.
     */
    @Column(columnDefinition = "text", nullable = false)
    private String testCasesJson;

    /** JSON array of sample cases (same shape) shown to the user / used by "Run". */
    @Column(columnDefinition = "text")
    private String sampleCasesJson;

    @Column(nullable = false)
    private int timeLimitMs = 2000;

    @Column(nullable = false)
    private int memoryLimitMb = 256;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
    public String getMethodName() { return methodName; }
    public void setMethodName(String methodName) { this.methodName = methodName; }
    public String getStarterCode() { return starterCode; }
    public void setStarterCode(String starterCode) { this.starterCode = starterCode; }
    public String getTestCasesJson() { return testCasesJson; }
    public void setTestCasesJson(String testCasesJson) { this.testCasesJson = testCasesJson; }
    public String getSampleCasesJson() { return sampleCasesJson; }
    public void setSampleCasesJson(String sampleCasesJson) { this.sampleCasesJson = sampleCasesJson; }
    public int getTimeLimitMs() { return timeLimitMs; }
    public void setTimeLimitMs(int timeLimitMs) { this.timeLimitMs = timeLimitMs; }
    public int getMemoryLimitMb() { return memoryLimitMb; }
    public void setMemoryLimitMb(int memoryLimitMb) { this.memoryLimitMb = memoryLimitMb; }
}
