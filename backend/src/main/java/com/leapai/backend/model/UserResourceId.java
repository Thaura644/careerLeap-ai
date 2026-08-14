package com.leapai.backend.model;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/** Composite key for {@link UserResource}: one row per (user, resource) pair. */
@Embeddable
public class UserResourceId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "resource_id")
    private Long resourceId;

    public UserResourceId() {}

    public UserResourceId(Long userId, Long resourceId) {
        this.userId = userId;
        this.resourceId = resourceId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserResourceId)) return false;
        UserResourceId that = (UserResourceId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(resourceId, that.resourceId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, resourceId);
    }
}
