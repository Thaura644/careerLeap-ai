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
 * <p>Configuration is read from environment variables:
 * <ul>
 *   <li>{@code LLM_API_KEY} — required for real generation. When unset, the
 *       service falls back to real deterministic logic instead: the
 *       {@link RoadmapEngine} for roadmaps and a retrieval-based responder
 *       over the user's own roadmap/goals/catalog for chat. Fallbacks are
 *       marked {@code "source": "engine"} — never "mock", never presented as
 *       AI output.</li>
 *   <li>{@code LLM_BASE_URL} — default {@code https://openrouter.ai/api/v1}.</li>
 *   <li>{@code LLM_MODEL} — default {@code google/gemma-4-31b-it:free}.</li>
 *   <li>{@code LLM_TIMEOUT_SECONDS} — default 60.</li>
 * </ul>
 *
 * <p><b>Free models only.</b> The company key is an OpenRouter key to be used
 * exclusively with free models. When the base URL is OpenRouter, a configured
 * model that does not end in {@code :free} is refused (the service behaves as
 * if unconfigured and uses the engine fallback, with a warning) — the key can
 * never be silently pointed at a paid model.
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

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final RoadmapEngine roadmapEngine;
    private final RetrievalChatService retrievalChat;

    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final int timeoutSeconds;

    public LlmService(
            ObjectMapper objectMapper,
            RoadmapEngine roadmapEngine,
            RetrievalChatService retrievalChat,
            @Value("${LLM_API_KEY:}") String apiKey,
            @Value("${LLM_BASE_URL:https://openrouter.ai/api/v1}") String baseUrl,
            @Value("${LLM_MODEL:google/gemma-4-31b-it:free}") String model,
            @Value("${LLM_TIMEOUT_SECONDS:60}") int timeoutSeconds) {
        this.objectMapper = objectMapper;
        this.roadmapEngine = roadmapEngine;
        this.retrievalChat = retrievalChat;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.baseUrl = (baseUrl == null || baseUrl.isBlank())
                ? "https://openrouter.ai/api/v1"
                : baseUrl.replaceAll("/+$", "");
        this.model = model == null || model.isBlank() ? "google/gemma-4-31b-it:free" : model.trim();
        this.timeoutSeconds = timeoutSeconds > 0 ? timeoutSeconds : 60;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        if (isOpenRouter() && !this.model.endsWith(":free")) {
            log.warn("[llm] REFUSING model '{}' — OpenRouter key is for FREE models only. "
                    + "Using the deterministic engine instead of this model.", this.model);
        }
    }

    private boolean isOpenRouter() {
        return baseUrl.contains("openrouter.ai");
    }

    /** Configured only when a key exists AND (not OpenRouter OR the model is free).
     *  This is the free-models-only guard: with the OpenRouter key, a paid model
     *  is never called — the service falls back to the deterministic engine. */
    public boolean isConfigured() {
        if (apiKey.isEmpty()) return false;
        if (isOpenRouter() && !model.endsWith(":free")) return false;
        return true;
    }

    /**
     * Chat completion. With a key, the real LLM answers. Without one, a
     * retrieval-based responder grounded in the user's actual roadmap, goals,
     * and the library catalog — real data, not canned phrases.
     */
    public Map<String, Object> chat(String prompt, List<Map<String, String>> history, Long userId) {
        if (!isConfigured()) {
            return Map.of("source", "engine", "response", retrievalChat.respond(prompt, userId));
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
            log.warn("[llm] chat failed, falling back to engine: {}", e.getMessage());
            return Map.of("source", "engine", "response", retrievalChat.respond(prompt, userId));
        }
    }

    /** Structured roadmap. LLM when configured; otherwise the deterministic engine. */
    public Map<String, Object> generateRoadmap(Map<String, Object> profile) {
        if (!isConfigured()) {
            return roadmapEngine.generate(profile);
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
            log.warn("[llm] roadmap generation failed, falling back to engine: {}", e.getMessage());
            return roadmapEngine.generate(profile);
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

    private static String truncate(String value, int max) {
        return value == null ? "" : value.length() <= max ? value : value.substring(0, max) + "…";
    }
}
