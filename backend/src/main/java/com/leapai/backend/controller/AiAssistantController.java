package com.leapai.backend.controller;

import com.leapai.backend.service.MockDataService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final MockDataService mockDataService;

    public AiAssistantController(MockDataService mockDataService) {
        this.mockDataService = mockDataService;
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> body) {
        String prompt = body.getOrDefault("prompt", "");
        return Map.of("response", mockDataService.chatResponse(prompt));
    }
}
