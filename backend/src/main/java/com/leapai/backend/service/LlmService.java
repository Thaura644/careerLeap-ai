package com.leapai.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Real LLM integration for Leap.ai (OpenAI-compatible chat completions).
 *
 * <p>Configuration is read from environment variables (Spring relaxed binding):
 * <ul>
 *   <li>{@code LLM_API_KEY} — required for real generation. When unset, the
 *       service falls back to {@link MockDataService} and marks every response
 *       with {@code "source": "mock"} so mock output is never presented as
 *       real AI.</li>
 *   <li>{@code LLM_BASE_URL} — default {@code https://api.deepseek.com}. Any
 *       OpenAI-compatible provider works (OpenRouter, OpenAI, Groq, ...).</li>
 *   <li>{@code LLM_MODEL} — default {@code deepseek-chat}.</li>
 *   <li>{@code LLM_TIMEOUT_SECONDS} — default 60.</li>
 * </ul>
 */
@Service
public class LlmService {

    private static final Logger log = LoggerFactory.getLogger(LlmService.class);

    private static final String SYSTEM_CHAT_PROMPT =
            "You are Leap.ai's career coach. You help professionals accelerate their career with "
            + "concise, specific, actionable advice. Keep answers short (under 200 words), concrete, "
            + "and grounded — never invent credentials, jobs, or statistics. If asked about something "
            + "you cannot know, say so.";

    private static final String SYSTEM_ROADMAP_PROMPT =
            "You are Leap.ai's career roadmap engine. Given a user profile as JSON, produce a "
            + "personalized career roadmap. Respond with ONLY valid JSON, no markdown, in exactly "
            + "this shape: {\"roadmap\": {\"summary\": string, \"phases\": [{\"title\": string, "
            + "\"duration\": string, \"focus\": string, \"skills\": [string], \"milestones\": [string], "
            + "\"resources\": [{\"title\": string, \"type\": string}]}]}}. Use 3-5 phases covering "
            + "assessment, skill development, real-world proof, and application/interview. Be specific "
            + "to the user's current and target role.";

    private final MockDataService mockDataService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final int timeoutSeconds;

    public LlmService(
            MockDataService mockDataService,
            ObjectMapper objectMapper,
            @Value("${LLM_API_KEY:}") String apiKey,
            @Value("${LLM_BASE_URL:https://api.deepseek.com}") String baseUrl,
            @Value("${LLM_MODEL:deepseek-chat}") String model,
            @Value("${LLM_TIMEOUT_SECONDS:60}") int timeoutSeconds) {
        this.mockDataService = mockDataService;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.baseUrl = (baseUrl == null || baseUrl.isBlank())
                ? "https://api.deepseek.com"
                : baseUrl.replaceAll("/+$", "");
        this.model = model == null || model.isBlank() ? "deepseek-chat" : model;
        this.timeoutSeconds = timeoutSeconds > 0 ? timeoutSeconds : 60;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public boolean isConfigured() {
        return !apiKey.isEmpty();
    }

    /** Chat completion. Falls back to the mock keyword responder when no key is set. */
    public Map<String, Object> chat(String prompt, List<Map<String, String>> history) {
        if (!isConfigured()) {
            return Map.of("source", "mock", "response", mockDataService.chatResponse(prompt));
        }
        try {
            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", SYSTEM_CHAT_PROMPT));
            if (history != null) {
                for (Map<String, String> message : history) {
                    String role = message.getOrDefault("role", "user");
                    if (!role.equals("system") && !role.equals("user") && !role.equals("assistant")) {
                        role = "user";
                    }
                    messages.add(Map.of("role", role, "content", message.getOrDefault("content", "")));
                }
            }
            messages.add(Map.of("role", "user", "content", prompt));
            String text = complete(messages);
            return Map.of("source", "llm", "response", text);
        } catch (Exception e) {
            log.warn("[llm] chat failed, falling back to mock: {}", e.getMessage());
            return Map.of("source", "mock", "response", mockDataService.chatResponse(prompt));
        }
    }

    /**
     * Generates a structured career roadmap from a profile.
     * Falls back to a placeholder roadmap (marked {@code source: "mock"}) when
     * no key is set or the LLM call fails, so the UI always has something to render.
     */
    public Map<String, Object> generateRoadmap(Map<String, Object> profile) {
        Map<String, Object> fallback = mockRoadmap();
        if (!isConfigured()) {
            fallback.put("source", "mock");
            return fallback;
        }
        try {
            String userJson = objectMapper.writeValueAsString(profile);
            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", SYSTEM_ROADMAP_PROMPT),
                    Map.of("role", "user", "content", "User profile (JSON):\n" + userJson));
            String text = complete(messages);
            JsonNode node = objectMapper.readTree(text);
            JsonNode roadmap = node.has("roadmap") ? node.get("roadmap") : node;
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("source", "llm");
            result.put("roadmap", objectMapper.convertValue(roadmap, Map.class));
            return result;
        } catch (Exception e) {
            log.warn("[llm] roadmap generation failed, falling back to mock: {}", e.getMessage());
            fallback.put("source", "mock");
            return fallback;
        }
    }

    private String complete(List<Map<String, Object>> messages) throws Exception {
        Map<String, Object> payload = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.7,
                "max_tokens", 2000);
        String body = objectMapper.writeValueAsString(payload);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/chat/completions"))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IllegalStateException("LLM API returned " + response.statusCode()
                    + ": " + truncate(response.body(), 300));
        }
        JsonNode node = objectMapper.readTree(response.body());
        String content = node.path("choices").path(0).path("message").path("content").asText();
        if (content.isBlank()) {
            throw new IllegalStateException("LLM API returned empty content");
        }
        return content;
    }

    private Map<String, Object> mockRoadmap() {
        Map<String, Object> roadmap = new LinkedHashMap<>();
        roadmap.put("summary",
                "Placeholder roadmap — set the LLM_API_KEY environment variable to generate a real AI roadmap.");
        List<Map<String, Object>> phases = new ArrayList<>();
        phases.add(phase("Phase 1 — Assess & Skill Gap", "Weeks 1–4",
                "Map the gap between your current role and your target role",
                List.of("Skills inventory", "Target-role research"),
                List.of("Complete a skill-gap analysis", "Write down your target role's top 5 requirements"),
                List.of(resource("Career skill-gap guide", "guide"))));
        phases.add(phase("Phase 2 — Build the Foundation", "Weeks 5–12",
                "Close the biggest gaps with focused practice",
                List.of("Deep work on top 2 gaps"),
                List.of("Complete one portfolio project", "Finish one certification or structured course"),
                List.of(resource("Structured course", "course"), resource("Practice project template", "template"))));
        phases.add(phase("Phase 3 — Proof & Application", "Weeks 13–20",
                "Create visible proof and start applying",
                List.of("Personal branding", "Interview practice"),
                List.of("Publish your case study", "Complete 3 mock interviews", "Apply to 10+ roles"),
                List.of(resource("Interview prep checklist", "checklist"))));
        roadmap.put("phases", phases);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("roadmap", roadmap);
        return result;
    }

    private static Map<String, Object> phase(
            String title, String duration, String focus,
            List<String> skills, List<String> milestones, List<Map<String, String>> resources) {
        Map<String, Object> phase = new LinkedHashMap<>();
        phase.put("title", title);
        phase.put("duration", duration);
        phase.put("focus", focus);
        phase.put("skills", skills);
        phase.put("milestones", milestones);
        phase.put("resources", resources);
        return phase;
    }

    private static Map<String, String> resource(String title, String type) {
        return Map.of("title", title, "type", type);
    }

    private static String truncate(String value, int max) {
        return value == null ? "" : value.length() <= max ? value : value.substring(0, max) + "…";
    }
}
