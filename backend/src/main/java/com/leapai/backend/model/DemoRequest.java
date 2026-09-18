package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;

/** A demo request submitted through the public "Request Demo" form. */
@Entity
@Table(name = "demo_requests")
public class DemoRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(length = 200)
    private String companyName;

    @Column(length = 20)
    private String teamSize;

    @Column(columnDefinition = "text")
    private String message;

    @Column(nullable = false, length = 40)
    private String demoDate;

    @Column(nullable = false, length = 20)
    private String timeSlot;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getTeamSize() { return teamSize; }
    public void setTeamSize(String teamSize) { this.teamSize = teamSize; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getDemoDate() { return demoDate; }
    public void setDemoDate(String demoDate) { this.demoDate = demoDate; }
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
