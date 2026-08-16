package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.ResourceEngine;
import com.leapai.backend.service.ResourcesService;
import com.leapai.backend.service.TopicCatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
public class ResourcesController {

    private final ResourcesService resourcesService;
    private final ResourceEngine resourceEngine;
    private final TopicCatalogService topicCatalog;

    public ResourcesController(ResourcesService resourcesService, ResourceEngine resourceEngine,
                               TopicCatalogService topicCatalog) {
        this.resourcesService = resourcesService;
        this.resourceEngine = resourceEngine;
        this.topicCatalog = topicCatalog;
    }

    @GetMapping
    public Map<String, Object> getResources() {
        return resourcesService.library(UserContext.require());
    }

    /** The maintained topic resource catalog (server-side, shared by all clients). */
    @GetMapping("/catalog")
    public Map<String, Object> topicCatalog() {
        return Map.of("topics", topicCatalog.catalog());
    }

    /**
     * Match a phrase (e.g. a roadmap segment's title + focus + skills) against
     * the catalog. Returns matched topics plus collected resources and tools.
     */
    @GetMapping("/catalog/match")
    public Map<String, Object> topicCatalogMatch(@RequestParam(defaultValue = "") String text) {
        return topicCatalog.match(text, 4);
    }

    /** Resource engine: search the curated open-source catalog. */
    @GetMapping("/engine/search")
    public Map<String, Object> engineSearch(@RequestParam(defaultValue = "") String q) {
        List<Map<String, Object>> results = resourceEngine.search(q, 12);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("results", results);
        m.put("total", results.size());
        return m;
    }

    /** Resource engine: import an open-source item into the library. */
    @PostMapping("/engine/import")
    public Map<String, Object> engineImport(@RequestBody Map<String, Object> body) {
        var imported = resourceEngine.importItem(
                String.valueOf(body.getOrDefault("title", "")),
                String.valueOf(body.getOrDefault("type", "Guide")),
                String.valueOf(body.getOrDefault("url", "")),
                String.valueOf(body.getOrDefault("source", "Web")),
                String.valueOf(body.getOrDefault("description", "")));
        return Map.of("imported", true, "id", String.valueOf(imported.getId()),
                "title", imported.getTitle());
    }

    /** Resource engine: import any URL by detecting its platform. */
    @PostMapping("/engine/import-url")
    public Map<String, Object> engineImportUrl(@RequestBody Map<String, Object> body) {
        var imported = resourceEngine.importByUrl(
                String.valueOf(body.getOrDefault("url", "")),
                String.valueOf(body.getOrDefault("title", "")));
        return Map.of("imported", true, "id", String.valueOf(imported.getId()),
                "title", imported.getTitle(), "source", ResourceEngine.platform(
                        String.valueOf(body.getOrDefault("url", ""))));
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

    /**
     * URL-keyed completion (used by the roadmap segment panel, where links are
     * catalog URLs rather than library rows). Returns the user's completed URLs.
     */
    @GetMapping("/progress")
    public Map<String, Object> progress() {
        return Map.of("completed", resourcesService.completedUrls(UserContext.require()));
    }

    /** Mark a resource URL complete (or undo it). */
    @PutMapping("/progress")
    public Map<String, Object> setProgress(@RequestBody Map<String, Object> body) {
        return resourcesService.setCompleted(
                UserContext.require(),
                String.valueOf(body.getOrDefault("url", "")),
                Boolean.TRUE.equals(body.get("completed")));
    }
}
