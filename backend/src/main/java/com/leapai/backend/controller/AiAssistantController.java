package com.leapai.backend.controller;

import com.leapai.backend.service.LlmService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final LlmService llmService;

    public AiAssistantController(LlmService llmService) {
        this.llmService = llmService;
    }

    /**
     * Chat with the Leap.ai career coach. Falls back to the mock responder when
     * no LLM_API_KEY is configured; the response then carries {@code "source": "mock"}.
     *
     * @param body {@code {"prompt": string, "history": [{"role", "content"}]}}
     */
    @PostMapping("/chat")
    public Map<String, Object> chat(@RequestBody Map<String, Object> body) {
        String prompt = String.valueOf(body.getOrDefault("prompt", ""));
        @SuppressWarnings("unchecked")
        List<Map<String, String>> history = (List<Map<String, String>>) body.getOrDefault("history", List.of());
        return new LinkedHashMap<>(llmService.chat(prompt, history));
    }
}
