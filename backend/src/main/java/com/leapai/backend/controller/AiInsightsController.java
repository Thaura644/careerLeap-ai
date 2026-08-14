package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.InsightsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class AiInsightsController {

    private final InsightsService insightsService;

    public AiInsightsController(InsightsService insightsService) {
        this.insightsService = insightsService;
    }

    /** Insights derived from the user's real profile, roadmap, and goals. */
    @GetMapping
    public Map<String, Object> getAiInsights() {
        return insightsService.insights(UserContext.require());
    }

    /**
     * Generate (and persist) a personalized career roadmap.
     * Profile is optional; missing fields fall back to the saved profile.
     * Response carries {@code source}: {@code llm} or {@code engine} — never mock.
     */
    @PostMapping("/roadmap")
    public Map<String, Object> generateRoadmap(@RequestBody(required = false) Map<String, Object> profile) {
        return insightsService.generateRoadmap(UserContext.require(), profile == null ? Map.of() : profile);
    }

    /** Real library recommendations scored against the user's profile. */
    @PostMapping("/recommendations")
    public Map<String, Object> recommendations() {
        return insightsService.recommendations(UserContext.require());
    }
}
