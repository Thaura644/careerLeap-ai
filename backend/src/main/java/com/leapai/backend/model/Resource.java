package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * A catalog entry in the learning library. Content is seeded on first boot;
 * per-user state (bookmarked / completed) lives in {@link UserResource}.
 */
@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false)
    private double rating;

    @Column(nullable = false)
    private int reviews;

    @Column(nullable = false, length = 60)
    private String duration;

    /** Free vs Pro-gated content. */
    @Column(nullable = false)
    private boolean isPro;

    /** Category within the library: TRENDING, RECOMMENDED, or OTHER. */
    @Column(nullable = false, length = 20)
    private String category = "OTHER";

    @Column(length = 1000)
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviews() { return reviews; }
    public void setReviews(int reviews) { this.reviews = reviews; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public boolean isPro() { return isPro; }
    public void setPro(boolean pro) { isPro = pro; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
