package com.leapai.backend.service;

import com.leapai.backend.config.ForbiddenException;
import com.leapai.backend.model.Event;
import com.leapai.backend.model.Resource;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.EventRepository;
import com.leapai.backend.repository.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Creator Studio — the Pro-gated side of the resource engine. Pro members are
 * creators: they can publish their own guides/courses/workshops to the library
 * and host live events (webinars, workshops, courses, guides) with a join link,
 * including going live/ending live. Everything is enforced server-side: a free
 * account gets a 403, not a hidden button.
 */
@Service
public class CreatorService {

    private static final Logger log = LoggerFactory.getLogger(CreatorService.class);

    /** Free, real, open-source live-room platform used when a host doesn't
     *  supply their own meeting link. */
    private static final String JITSI_BASE = "https://meet.jit.si/";

    private static final List<String> EVENT_TYPES = List.of("Webinar", "Workshop", "Course", "Guide");

    private final ResourceRepository resources;
    private final EventRepository events;
    private final PaymentService payments;

    public CreatorService(ResourceRepository resources, EventRepository events,
                          PaymentService payments) {
        this.resources = resources;
        this.events = events;
        this.payments = payments;
    }

    /** Only Pro members can be creators. */
    private void requireCreator(User user) {
        if (!payments.isPro(user)) {
            throw new ForbiddenException("Becoming a creator is a Pro feature — upgrade to publish or go live.");
        }
    }

    public Map<String, Object> status(User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("creator", payments.isPro(user));
        return m;
    }

    // -------------------------------------------------------------- resources

    /** Publish a resource (guide/course/workshop/...) to the library. */
    @Transactional
    public Map<String, Object> createResource(User user, Map<String, Object> body) {
        requireCreator(user);
        String title = str(body, "title");
        if (title.isBlank()) throw new IllegalArgumentException("A title is required.");
        String url = str(body, "url");
        if (url.isBlank()) throw new IllegalArgumentException("A link (URL) is required.");
        String type = str(body, "type");
        if (type.isBlank()) type = "Guide";

        Resource r = new Resource();
        r.setTitle(title);
        r.setType(type);
        r.setUrl(url);
        r.setDescription(str(body, "description"));
        r.setSource("creator");
        r.setCategory("OTHER");
        r.setCreatedById(user.getId());
        r.setCreatedByName(user.getFullName());
        r.setRating(0);
        r.setReviews(0);
        r.setDuration("By " + user.getFullName());
        r.setPro(false);
        resources.save(r);
        log.info("[creator] {} published resource '{}' ({})", user.getEmail(), title, type);
        return resourceDto(r);
    }

    public List<Map<String, Object>> myResources(User user) {
        requireCreator(user);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Resource r : resources.findByCreatedByIdOrderByIdDesc(user.getId())) {
            out.add(resourceDto(r));
        }
        return out;
    }

    /** Remove one of the creator's own resources. */
    @Transactional
    public Map<String, Object> deleteResource(User user, Long id) {
        requireCreator(user);
        Resource r = resources.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        if (!user.getId().equals(r.getCreatedById())) {
            throw new ForbiddenException("You can only delete your own resources.");
        }
        resources.delete(r);
        return Map.of("deleted", true, "id", String.valueOf(id));
    }

    // ----------------------------------------------------------------- events

    /** Schedule a live event (workshop, webinar, course, or guide session). */
    @Transactional
    public Map<String, Object> createEvent(User user, Map<String, Object> body) {
        requireCreator(user);
        String title = str(body, "title");
        if (title.isBlank()) throw new IllegalArgumentException("A title is required.");
        String type = str(body, "type");
        if (!EVENT_TYPES.contains(type)) {
            throw new IllegalArgumentException("Type must be one of: " + String.join(", ", EVENT_TYPES));
        }
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(str(body, "description"));
        e.setType(type);
        e.setDate(str(body, "date"));
        e.setTime(str(body, "time"));
        e.setColor("purple");
        e.setPro(true);
        e.setHostById(user.getId());
        e.setHostName(user.getFullName());
        e.setJoinUrl(str(body, "joinUrl"));
        events.save(e);
        log.info("[creator] {} scheduled event '{}' ({})", user.getEmail(), title, type);
        return eventDto(e);
    }

    public List<Map<String, Object>> myEvents(User user) {
        requireCreator(user);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Event e : events.findByHostByIdOrderByIdDesc(user.getId())) {
            out.add(eventDto(e));
        }
        return out;
    }

    /** Go live: opens the room to attendees. A host-provided link is used when
     *  given; otherwise a free Jitsi Meet room is generated (real, joinable). */
    @Transactional
    public Map<String, Object> goLive(User user, Long id) {
        requireCreator(user);
        Event e = ownEvent(user, id);
        if (e.getJoinUrl() == null || e.getJoinUrl().isBlank()) {
            e.setJoinUrl(JITSI_BASE + roomSlug(e));
        }
        e.setLive(true);
        events.save(e);
        log.info("[creator] {} went live on '{}'", user.getEmail(), e.getTitle());
        return eventDto(e);
    }

    @Transactional
    public Map<String, Object> endLive(User user, Long id) {
        requireCreator(user);
        Event e = ownEvent(user, id);
        e.setLive(false);
        events.save(e);
        log.info("[creator] {} ended live on '{}'", user.getEmail(), e.getTitle());
        return eventDto(e);
    }

    private Event ownEvent(User user, Long id) {
        Event e = events.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (!user.getId().equals(e.getHostById())) {
            throw new ForbiddenException("You can only manage your own events.");
        }
        return e;
    }

    /** Deterministic, readable Jitsi room name for an event. */
    private static String roomSlug(Event e) {
        String base = e.getTitle().toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (base.length() > 40) base = base.substring(0, 40);
        return "LeapAi-" + e.getId() + "-" + base;
    }

    // ------------------------------------------------------------------ dtos

    private Map<String, Object> resourceDto(Resource r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", String.valueOf(r.getId()));
        m.put("title", r.getTitle());
        m.put("type", r.getType());
        m.put("url", r.getUrl());
        m.put("description", r.getDescription());
        m.put("source", "creator");
        m.put("createdByName", r.getCreatedByName());
        return m;
    }

    private Map<String, Object> eventDto(Event e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", String.valueOf(e.getId()));
        m.put("title", e.getTitle());
        m.put("description", e.getDescription());
        m.put("type", e.getType());
        m.put("date", e.getDate());
        m.put("time", e.getTime());
        m.put("hostName", e.getHostName());
        m.put("joinUrl", e.getJoinUrl());
        m.put("isLive", e.isLive());
        return m;
    }

    private static String str(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v == null ? "" : String.valueOf(v).trim();
    }
}
