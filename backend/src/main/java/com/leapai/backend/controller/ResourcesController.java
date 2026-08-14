package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.ResourcesService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/resources")
public class ResourcesController {

    private final ResourcesService resourcesService;

    public ResourcesController(ResourcesService resourcesService) {
        this.resourcesService = resourcesService;
    }

    @GetMapping
    public Map<String, Object> getResources() {
        return resourcesService.library(UserContext.require());
    }

    @PostMapping("/{id}/bookmark")
    public Map<String, Object> toggleBookmark(@PathVariable("id") Long id) {
        return resourcesService.toggleBookmark(UserContext.require(), id);
    }

    @PostMapping("/{id}/complete")
    public Map<String, Object> markCompleted(@PathVariable("id") Long id,
                                             @RequestBody(required = false) Map<String, Object> body) {
        boolean completed = body == null || !Boolean.FALSE.equals(body.get("completed"));
        return resourcesService.markCompleted(UserContext.require(), id, completed);
    }
}
