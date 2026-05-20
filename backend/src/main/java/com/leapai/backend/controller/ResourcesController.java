package com.leapai.backend.controller;

import com.leapai.backend.service.MockDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
public class ResourcesController {

    private final MockDataService mockDataService;

    public ResourcesController(MockDataService mockDataService) {
        this.mockDataService = mockDataService;
    }

    @GetMapping
    public List<Map<String, Object>> getResources() {
        return mockDataService.resources();
    }
}
