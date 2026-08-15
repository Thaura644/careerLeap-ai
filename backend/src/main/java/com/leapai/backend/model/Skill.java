package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/** A skill in the selectable catalog. Users pick existing skills or create new ones. */
@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Display name, e.g. "TypeScript". */
    @Column(nullable = false, length = 80)
    private String name;

    /** Lowercased/trimmed name used for uniqueness and search. */
    @Column(nullable = false, unique = true, length = 80)
    private String normalizedName;

    /** Category, e.g. "Languages", "Cloud & DevOps", "Soft Skills". */
    @Column(nullable = false, length = 60)
    private String category = "Other";

    /** How many users have saved this skill in their profile (popularity signal). */
    @Column(nullable = false)
    private long usageCount = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getNormalizedName() { return normalizedName; }
    public void setNormalizedName(String normalizedName) { this.normalizedName = normalizedName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public long getUsageCount() { return usageCount; }
    public void setUsageCount(long usageCount) { this.usageCount = usageCount; }
}
