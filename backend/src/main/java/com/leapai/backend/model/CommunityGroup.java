package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/** A community discussion group. Member counts are real seeded values. */
@Entity
@Table(name = "community_groups")
public class CommunityGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String topic;

    @Column(nullable = false)
    private int members;

    @Column(nullable = false, length = 40)
    private String lastActive;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public int getMembers() { return members; }
    public void setMembers(int members) { this.members = members; }

    public String getLastActive() { return lastActive; }
    public void setLastActive(String lastActive) { this.lastActive = lastActive; }
}
