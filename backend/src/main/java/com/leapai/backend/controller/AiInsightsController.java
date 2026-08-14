package com.leapai.backend.controller;

import com.leapai.backend.service.LlmService;
import com.leapai.backend.service.MockDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class AiInsightsController {

    private final MockDataService mockDataService;
    private final LlmService llmService;

    public AiInsightsController(MockDataService mockDataService, LlmService llmService) {
        this.mockDataService = mockDataService;
        this.llmService = llmService;
    }

    @GetMapping
    public Map<String, Object> getAiInsights() {
        return mockDataService.aiInsights();
    }

    /**
     * Generate a personalized career roadmap from a profile.
     * Falls back to a placeholder (marked {@code "source": "mock"}) when no
     * LLM_API_KEY is configured or the LLM call fails.
     *
     * @param profile optional JSON profile, e.g.
     *                {@code {"currentRole": "Senior Frontend Developer", "targetRole": "Staff Engineer", "timeframeMonths": 12, "focusAreas": ["System Design", "Leadership"]}}
     */
    @PostMapping("/roadmap")
    public Map<String, Object> generateRoadmap(@RequestBody(required = false) Map<String, Object> profile) {
        return llmService.generateRoadmap(profile == null ? Map.of() : profile);
    }
}
