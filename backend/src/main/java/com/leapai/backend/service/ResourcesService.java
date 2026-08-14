package com.leapai.backend.service;

import com.leapai.backend.model.Event;
import com.leapai.backend.model.Resource;
import com.leapai.backend.model.User;
import com.leapai.backend.model.UserResource;
import com.leapai.backend.model.UserResourceId;
import com.leapai.backend.repository.EventRepository;
import com.leapai.backend.repository.ResourceRepository;
import com.leapai.backend.repository.UserResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The learning library. Catalog entries come from the seeded database; each
 * user's bookmark/completion state is persisted per (user, resource) pair, so
 * state is real, scoped, and survives restarts.
 */
@Service
public class ResourcesService {

    private final ResourceRepository resources;
    private final UserResourceRepository userResources;
    private final EventRepository events;

    public ResourcesService(ResourceRepository resources, UserResourceRepository userResources,
                            EventRepository events) {
        this.resources = resources;
        this.userResources = userResources;
        this.events = events;
    }

    public Map<String, Object> library(User user) {
        Map<Long, UserResource> state = stateByResourceId(user.getId());

        List<Map<String, Object>> trending = toDtos(
                resources.findByCategoryOrderByIdAsc("TRENDING"), state);
        List<Map<String, Object>> recommended = toDtos(
                resources.findByCategoryOrderByIdAsc("RECOMMENDED"), state);
        List<Map<String, Object>> bookmarked = toDtos(bookmarkedResources(user.getId()), state);
        List<Map<String, Object>> completed = toDtos(completedResources(user.getId()), state);
        List<Map<String, Object>> upcomingEvents = eventDtos(events.findAllByOrderByIdAsc());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("trendingResources", trending);
        result.put("recommendedResources", recommended);
        result.put("bookmarkedResources", bookmarked);
        result.put("completedResources", completed);
        result.put("upcomingEvents", upcomingEvents);
        return result;
    }

    @Transactional
    public Map<String, Object> toggleBookmark(User user, Long resourceId) {
        if (!resources.existsById(resourceId)) {
            throw new IllegalArgumentException("Resource not found");
        }
        UserResource ur = userResources.findById(new UserResourceId(user.getId(), resourceId))
                .orElseGet(() -> new UserResource(user.getId(), resourceId));
        ur.setBookmarked(!ur.isBookmarked());
        userResources.save(ur);
        return Map.of("id", String.valueOf(resourceId),
                "isBookmarked", ur.isBookmarked(),
                "message", "Bookmark updated");
    }

    @Transactional
    public Map<String, Object> markCompleted(User user, Long resourceId, boolean completed) {
        if (!resources.existsById(resourceId)) {
            throw new IllegalArgumentException("Resource not found");
        }
        UserResource ur = userResources.findById(new UserResourceId(user.getId(), resourceId))
                .orElseGet(() -> new UserResource(user.getId(), resourceId));
        ur.setCompleted(completed);
        ur.setCompletedAt(completed ? Instant.now() : null);
        userResources.save(ur);
        return Map.of("id", String.valueOf(resourceId),
                "isCompleted", ur.isCompleted(),
                "message", "Progress updated");
    }

    private Map<Long, UserResource> stateByResourceId(Long userId) {
        Map<Long, UserResource> map = new LinkedHashMap<>();
        for (UserResource ur : userResources.findByUserId(userId)) {
            map.put(ur.getId().getResourceId(), ur);
        }
        return map;
    }

    private List<Resource> bookmarkedResources(Long userId) {
        List<Resource> result = new ArrayList<>();
        for (UserResource ur : userResources.findByUserIdAndIsBookmarkedTrue(userId)) {
            resources.findById(ur.getId().getResourceId()).ifPresent(result::add);
        }
        return result;
    }

    private List<Resource> completedResources(Long userId) {
        List<Resource> result = new ArrayList<>();
        for (UserResource ur : userResources.findByUserIdAndIsCompletedTrue(userId)) {
            resources.findById(ur.getId().getResourceId()).ifPresent(result::add);
        }
        return result;
    }

    private List<Map<String, Object>> toDtos(List<Resource> list, Map<Long, UserResource> state) {
        List<Map<String, Object>> dtos = new ArrayList<>();
        for (Resource r : list) {
            UserResource ur = state.get(r.getId());
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", String.valueOf(r.getId()));
            dto.put("title", r.getTitle());
            dto.put("type", r.getType());
            dto.put("rating", r.getRating());
            dto.put("reviews", r.getReviews());
            dto.put("duration", r.getDuration());
            dto.put("isPro", r.isPro());
            dto.put("isBookmarked", ur != null && ur.isBookmarked());
            dto.put("isCompleted", ur != null && ur.isCompleted());
            dto.put("description", r.getDescription());
            // No stock photo assets: the UI renders a deterministic gradient block per title.
            dto.put("image", "");
            dtos.add(dto);
        }
        return dtos;
    }

    private List<Map<String, Object>> eventDtos(List<Event> list) {
        List<Map<String, Object>> dtos = new ArrayList<>();
        for (Event e : list) {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", String.valueOf(e.getId()));
            dto.put("title", e.getTitle());
            dto.put("description", e.getDescription());
            dto.put("type", e.getType());
            dto.put("isPro", e.isPro());
            dto.put("date", e.getDate());
            dto.put("time", e.getTime());
            dto.put("color", e.getColor());
            dtos.add(dto);
        }
        return dtos;
    }
}
