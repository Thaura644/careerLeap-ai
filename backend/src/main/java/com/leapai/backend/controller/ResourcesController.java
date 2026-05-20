package com.leapai.backend.controller;

import com.leapai.backend.service.MockDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/resources")
public class ResourcesController {

    private final MockDataService mockDataService;

    public ResourcesController(MockDataService mockDataService) {
        this.mockDataService = mockDataService;
    }

    @GetMapping
    public Map<String, Object> getResources() {
        return mockDataService.resources();
    }

    @PostMapping("/{id}/bookmark")
    public Map<String, Object> toggleBookmark(@PathVariable("id") String id) {
        return mockDataService.toggleBookmark(id);
    }
}
