package com.leapai.backend.controller;

import com.leapai.backend.service.MockDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final MockDataService mockDataService;

    public DashboardController(MockDataService mockDataService) {
        this.mockDataService = mockDataService;
    }

    @GetMapping
    public Map<String, Object> getDashboardData() {
        return mockDataService.dashboard();
    }
}
