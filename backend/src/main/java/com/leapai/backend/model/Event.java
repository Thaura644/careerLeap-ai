package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/** A real, seeded upcoming event. No invented attendee counts. */
@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false)
    private boolean isPro;

    @Column(nullable = false, length = 60)
    private String date;

    @Column(nullable = false, length = 60)
    private String time;

    @Column(nullable = false, length = 20)
    private String color;

    /** Creator account hosting this event (null for seeded events). */
    @Column(name = "host_by_id")
    private Long hostById;

    @Column(name = "host_name", length = 200)
    private String hostName;

    /** Where attendees join: the host's meeting link (e.g. a Jitsi room). */
    @Column(name = "join_url", length = 500)
    private String joinUrl;

    /** True while the host is broadcasting the session live. */
    @Column(name = "is_live", nullable = false)
    private boolean isLive = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isPro() { return isPro; }
    public void setPro(boolean pro) { isPro = pro; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Long getHostById() { return hostById; }
    public void setHostById(Long hostById) { this.hostById = hostById; }

    public String getHostName() { return hostName; }
    public void setHostName(String hostName) { this.hostName = hostName; }

    public String getJoinUrl() { return joinUrl; }
    public void setJoinUrl(String joinUrl) { this.joinUrl = joinUrl; }

    public boolean isLive() { return isLive; }
    public void setLive(boolean live) { isLive = live; }
}
