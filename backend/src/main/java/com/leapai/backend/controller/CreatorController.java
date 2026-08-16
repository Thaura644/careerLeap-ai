package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.CreatorService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Creator Studio endpoints. Every route requires a Pro account (enforced in
 * {@link CreatorService#requireCreator}); free users get a 403.
 */
@RestController
@RequestMapping("/api/creator")
public class CreatorController {

    private final CreatorService creatorService;

    public CreatorController(CreatorService creatorService) {
        this.creatorService = creatorService;
    }

    /** Whether the authenticated user can create/publish (i.e. is Pro). */
    @GetMapping("/status")
    public Map<String, Object> status() {
        return creatorService.status(UserContext.require());
    }

    // --- resources ----------------------------------------------------------

    @PostMapping("/resources")
    public Map<String, Object> createResource(@RequestBody Map<String, Object> body) {
        return creatorService.createResource(UserContext.require(), body);
    }

    @GetMapping("/resources")
    public Map<String, Object> myResources() {
        return Map.of("resources", creatorService.myResources(UserContext.require()));
    }

    @DeleteMapping("/resources/{id}")
    public Map<String, Object> deleteResource(@PathVariable Long id) {
        return creatorService.deleteResource(UserContext.require(), id);
    }

    // --- events / live ------------------------------------------------------

    @PostMapping("/events")
    public Map<String, Object> createEvent(@RequestBody Map<String, Object> body) {
        return creatorService.createEvent(UserContext.require(), body);
    }

    @GetMapping("/events")
    public Map<String, Object> myEvents() {
        return Map.of("events", creatorService.myEvents(UserContext.require()));
    }

    @PostMapping("/events/{id}/live")
    public Map<String, Object> goLive(@PathVariable Long id) {
        return creatorService.goLive(UserContext.require(), id);
    }

    @PostMapping("/events/{id}/live/end")
    public Map<String, Object> endLive(@PathVariable Long id) {
        return creatorService.endLive(UserContext.require(), id);
    }
}
