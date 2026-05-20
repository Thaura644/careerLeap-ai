package com.leapai.backend.controller;

import com.leapai.backend.service.MockDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class AiInsightsController {

    private final MockDataService mockDataService;

    public AiInsightsController(MockDataService mockDataService) {
        this.mockDataService = mockDataService;
    }

    @GetMapping
    public Map<String, Object> getAiInsights() {
        return mockDataService.aiInsights();
    }
}
