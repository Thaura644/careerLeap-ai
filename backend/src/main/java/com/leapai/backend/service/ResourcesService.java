package com.leapai.backend.service;

import com.leapai.backend.model.Event;
import com.leapai.backend.model.Resource;
import com.leapai.backend.model.ResourceProgress;
import com.leapai.backend.model.User;
import com.leapai.backend.model.UserResource;
import com.leapai.backend.model.UserResourceId;
import com.leapai.backend.repository.EventRepository;
import com.leapai.backend.repository.ResourceProgressRepository;
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
    private final ResourceProgressRepository resourceProgress;
    private final EventRepository events;

    public ResourcesService(ResourceRepository resources, UserResourceRepository userResources,
                            ResourceProgressRepository resourceProgress, EventRepository events) {
        this.resources = resources;
        this.userResources = userResources;
        this.resourceProgress = resourceProgress;
        this.events = events;
    }

    public Map<String, Object> library(User user) {
        Map<Long, UserResource> state = stateByResourceId(user.getId());

        List<Map<String, Object>> trending = toDtos(
                domainRanked(user, resources.findByCategoryOrderByIdAsc("TRENDING")), state);
        // Same-field content leads the recommended section so a healthcare
        // user sees healthcare picks first — engineering items never drown
        // them out just because they have more reviews.
        List<Map<String, Object>> recommended = toDtos(
                domainRanked(user, resources.findByCategoryOrderByIdAsc("RECOMMENDED")), state);
        List<Map<String, Object>> bookmarked = toDtos(bookmarkedResources(user.getId()), state);
        List<Map<String, Object>> completed = toDtos(completedResources(user.getId()), state);
        List<Map<String, Object>> upcomingEvents = eventDtos(events.findAllByOrderByIdAsc());

        // The resource engine's contributions: open-source imports and
        // creator-made content, surfaced as their own sections.
        List<Map<String, Object>> openResources = toDtos(
                resources.findBySourceOrderByIdDesc("open"), state);
        List<Map<String, Object>> creatorResources = toDtos(
                resources.findBySourceOrderByIdDesc("creator"), state);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("trendingResources", trending);
        result.put("recommendedResources", recommended);
        result.put("bookmarkedResources", bookmarked);
        result.put("completedResources", completed);
        result.put("openResources", openResources);
        result.put("creatorResources", creatorResources);
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

    // ------------------------------------------------------- URL-keyed progress

    /**
     * Completed resource URLs for the user (URL-keyed progress, used by the
     * roadmap segment panel where links are catalog URLs, not library rows).
     */
    @Transactional(readOnly = true)
    public List<String> completedUrls(User user) {
        List<String> urls = new ArrayList<>();
        for (ResourceProgress p : resourceProgress.findByUserId(user.getId())) {
            if (p.isCompleted()) urls.add(p.getResourceUrl());
        }
        return urls;
    }

    /** Mark a resource URL complete (or undo it). Idempotent, per-user. */
    @Transactional
    public Map<String, Object> setCompleted(User user, String url, boolean completed) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("Resource URL is required");
        }
        ResourceProgress p = resourceProgress.findByUserIdAndResourceUrl(user.getId(), url)
                .orElseGet(() -> {
                    ResourceProgress np = new ResourceProgress();
                    np.setUserId(user.getId());
                    np.setResourceUrl(url);
                    return np;
                });
        p.setCompleted(completed);
        p.setCompletedAt(completed ? Instant.now() : null);
        resourceProgress.save(p);
        return Map.of("url", url, "completed", p.isCompleted(), "message", "Progress updated");
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

    /**
     * Orders catalog resources so items in the user's field come first, then
     * general career content, then cross-field items. Stable within each group
     * (catalog order preserved).
     */
    private List<Resource> domainRanked(User user, List<Resource> list) {
        ResourceDomain.Domain userDomain = ResourceDomain.userDomain(
                user.getTargetRole(), user.getCurrentRole(), user.getIndustry(),
                csvList(user.getInterests()));
        if (userDomain == ResourceDomain.Domain.GENERAL) {
            return list;
        }
        List<Resource> same = new ArrayList<>();
        List<Resource> general = new ArrayList<>();
        List<Resource> other = new ArrayList<>();
        for (Resource r : list) {
            String text = (r.getTitle() + " " + nvl(r.getDescription(), "") + " "
                    + r.getType() + " " + r.getCategory()).toLowerCase(java.util.Locale.ROOT);
            ResourceDomain.Domain d = ResourceDomain.detect(text);
            if (d == userDomain) same.add(r);
            else if (d == ResourceDomain.Domain.GENERAL) general.add(r);
            else other.add(r);
        }
        List<Resource> ranked = new ArrayList<>(same);
        ranked.addAll(general);
        ranked.addAll(other);
        return ranked;
    }

    private static String nvl(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static List<String> csvList(String value) {
        List<String> out = new ArrayList<>();
        if (value == null || value.isBlank()) return out;
        for (String part : value.split(",")) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) out.add(trimmed);
        }
        return out;
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
            dto.put("url", r.getUrl());
            dto.put("source", r.getSource() == null || r.getSource().isBlank() ? "library" : r.getSource());
            dto.put("createdByName", r.getCreatedByName());
            dto.put("domain", ResourceDomain.label(ResourceDomain.detect(
                    (r.getTitle() + " " + nvl(r.getDescription(), "") + " "
                            + r.getType() + " " + r.getCategory()))));
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
            dto.put("hostName", e.getHostName());
            dto.put("joinUrl", e.getJoinUrl());
            dto.put("isLive", e.isLive());
            dtos.add(dto);
        }
        return dtos;
    }
}
