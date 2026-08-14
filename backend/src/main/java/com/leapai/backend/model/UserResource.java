package com.leapai.backend.model;

import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.time.Instant;

/**
 * Per-user state on a catalog resource: whether it's bookmarked and/or
 * completed. Persisted, so bookmarks survive restarts and are scoped to the
 * real authenticated user (no more shared mutable mock state).
 */
@Entity
@Table(name = "user_resources")
public class UserResource {

    @EmbeddedId
    private UserResourceId id;

    private boolean isBookmarked;

    private boolean isCompleted;

    private Instant completedAt;

    public UserResource() {}

    public UserResource(Long userId, Long resourceId) {
        this.id = new UserResourceId(userId, resourceId);
    }

    public UserResourceId getId() { return id; }
    public void setId(UserResourceId id) { this.id = id; }

    public boolean isBookmarked() { return isBookmarked; }
    public void setBookmarked(boolean bookmarked) { isBookmarked = bookmarked; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
