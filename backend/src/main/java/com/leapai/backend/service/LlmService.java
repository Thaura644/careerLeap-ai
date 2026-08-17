package com.leapai.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.model.TokenUsage;
import com.leapai.backend.repository.TokenUsageRepository;
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
 *       roadmap endpoint returns an honest error rather than a canned plan;
 *       chat falls back to a retrieval-based responder over the user's own
 *       roadmap/goals/catalog. No fabricated or templated output, ever.</li>
 *   <li>{@code LLM_BASE_URL} — default {@code https://openrouter.ai/api/v1}.</li>
 *   <li>{@code LLM_MODEL} — default {@code google/gemma-4-31b-it:free}.</li>
 *   <li>{@code LLM_TIMEOUT_SECONDS} — default 60.</li>
 * </ul>
 *
 * <p><b>Free models only.</b> The company key is an OpenRouter key to be used
 * exclusively with free models. When the base URL is OpenRouter, a configured
 * model that does not end in {@code :free} is refused (the service behaves as
 * if unconfigured, with a warning) — the key can never be silently pointed at
 * a paid model.
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
            + "deeply personalized career roadmap. Respond with ONLY valid JSON, no markdown, in exactly "
            + "this shape: {\"roadmap\": {\"summary\": string, \"phases\": [{\"title\": string, "
            + "\"duration\": string, \"focus\": string, \"skills\": [string], \"milestones\": [string], "
            + "\"resources\": [{\"title\": string, \"type\": string}]}]}}. Use 3-5 phases covering "
            + "assessment, skill development, real-world proof, and application/interview.\n"
            + "The profile contains the user's REAL data: current and target role, self-assessed "
            + "skills with proficiency, career goals, motivation, challenges, years of experience, "
            + "learning preferences, and progress made so far. Build the roadmap FROM that data — "
            + "reference their actual skills and gaps, their stated goals, their motivation, and "
            + "their weekly commitment when pacing phases. Every phase must be specific to THIS "
            + "user: name the exact skills they listed as gaps, tie milestones to their goals, and "
            + "pick resources that fit their preferred learning formats. Never return generic "
            + "placeholder phases; if the profile is thin, say so in the summary and still build "
            + "the best plan from what exists. Never invent credentials, employers, or statistics.";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final RetrievalChatService retrievalChat;
    private final AiContextService aiContext;
    private final TokenUsageRepository tokenUsage;

    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final int timeoutSeconds;

    public LlmService(
            ObjectMapper objectMapper,
            RetrievalChatService retrievalChat,
            AiContextService aiContext,
            TokenUsageRepository tokenUsage,
            @Value("${LLM_API_KEY:}") String apiKey,
            @Value("${LLM_BASE_URL:https://openrouter.ai/api/v1}") String baseUrl,
            @Value("${LLM_MODEL:google/gemma-4-31b-it:free}") String model,
            @Value("${LLM_TIMEOUT_SECONDS:60}") int timeoutSeconds) {
        this.objectMapper = objectMapper;
        this.retrievalChat = retrievalChat;
        this.aiContext = aiContext;
        this.tokenUsage = tokenUsage;
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
     * Chat completion. With a key, the real LLM answers, grounded in the
     * user's real data (profile, roadmap, goals, progress) and able to take
     * actions on their behalf. Without a key, a retrieval-based responder
     * grounded in the same data. Real data, not canned phrases.
     */
    public Map<String, Object> chat(String prompt, List<Map<String, String>> history, Long userId) {
        if (!isConfigured()) {
            return Map.of("source", "engine", "response", retrievalChat.respond(prompt, userId));
        }
        try {
            Map<String, Object> context = aiContext.context(userId);
            String contextJson = objectMapper.writeValueAsString(context);
            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content",
                    SYSTEM_CHAT_PROMPT
                    + "\n\nThe user's real account data (JSON) — use it to personalize every answer:"
                    + "\n" + truncate(contextJson, 8000)
                    + "\n\nYou can also take actions the user asks for. When the user wants you to"
                    + " (e.g. add a goal like 'pass the AWS exam', set my target role to 'Staff Engineer',"
                    + " or mark 'the System Design Primer' complete), end your reply with exactly one JSON"
                    + " object on its own line, in this shape, and nothing after it:"
                    + " {\"action\":\"create_goal\",\"title\":\"...\"} or"
                    + " {\"action\":\"update_profile\",\"targetRole\":\"...\"} or"
                    + " {\"action\":\"mark_complete\",\"title\":\"...\"}. Only take an action when"
                    + " explicitly asked, never for sensitive operations."));
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
            String text = complete(messages, 0.7, 2000, userId, "chat");

            // Execute any action the model requested, and fold the confirmation
            // into the reply the user sees.
            Map<String, Object> action = extractAction(text);
            if (action != null) {
                String confirmation = aiContext.execute(userId, action);
                if (confirmation != null) {
                    text = text + "\n\n" + confirmation;
                }
            }
            return Map.of("source", "llm", "response", text);
        } catch (Exception e) {
            log.warn("[llm] chat failed, falling back to engine: {}", e.getMessage());
            return Map.of("source", "engine", "response", retrievalChat.respond(prompt, userId));
        }
    }

    /** Pulls the trailing {"action": ...} JSON block out of a reply, if any. */
    private Map<String, Object> extractAction(String text) {
        if (text == null) return null;
        int start = text.lastIndexOf('{');
        int end = text.lastIndexOf('}');
        if (start < 0 || end <= start) return null;
        try {
            Map<String, Object> candidate = objectMapper.readValue(
                    text.substring(start, end + 1),
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            if (candidate.containsKey("action")) {
                return candidate;
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    /**
     * Structured roadmap, generated only by the LLM from the user's real data.
     * There is deliberately no template fallback: if the model is unavailable
     * or the call fails, we return an honest error so the UI can tell the user
     * to retry — never a canned plan presented as personalized.
     */
    public Map<String, Object> generateRoadmap(Map<String, Object> profile, Long userId) {
        if (!isConfigured()) {
            log.warn("[llm] roadmap requested but no LLM key configured — refusing to fabricate");
            return Map.of("source", "error", "error",
                    "Roadmap generation needs the AI model to be configured. Please try again later.");
        }
        try {
            String userJson = objectMapper.writeValueAsString(profile);
            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", SYSTEM_ROADMAP_PROMPT),
                    Map.of("role", "user", "content", "User profile (JSON):\n" + userJson));
            String text = complete(messages, 0.7, 2000, userId, "roadmap");
            JsonNode node = objectMapper.readTree(text);
            JsonNode roadmap = node.has("roadmap") ? node.get("roadmap") : node;
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("source", "llm");
            result.put("roadmap", objectMapper.convertValue(roadmap, Map.class));
            return result;
        } catch (Exception e) {
            log.warn("[llm] roadmap generation failed: {}", e.getMessage());
            return Map.of("source", "error", "error",
                    "The AI couldn't build your roadmap right now. Please try again in a moment.");
        }
    }

    private static final String SYSTEM_RESUME_PROMPT =
            "You are Leap.ai's resume parser. Extract the professional and technical skills "
            + "mentioned in the resume text. Respond with ONLY valid JSON, no markdown, in exactly "
            + "this shape: {\"skills\": [{\"name\": string, \"category\": string}]}. Normalize names "
            + "(e.g. 'JS' to 'JavaScript' when unambiguous), remove duplicates, and return at most 30. "
            + "If the text contains no recognizable skills, return {\"skills\": []}. Never invent "
            + "skills that are not in the text.";

    /**
     * Structured skill extraction from resume text. Returns a list of
     * {@code {"name": ..., "category": ...}} maps. When the LLM is unavailable
     * or the response cannot be parsed, returns an empty list (caller decides
     * how to report that honestly).
     */
    public List<Map<String, String>> extractSkillsFromResume(String resumeText, Long userId) {
        if (!isConfigured() || resumeText == null || resumeText.isBlank()) {
            return List.of();
        }
        try {
            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", SYSTEM_RESUME_PROMPT),
                    Map.of("role", "user", "content",
                            "Resume text:\n" + truncate(resumeText, 20000)));
            String text = complete(messages, 0.2, 1200, userId, "resume");
            JsonNode node = extractJson(text);
            if (node == null || !node.has("skills") || !node.get("skills").isArray()) {
                return List.of();
            }
            List<Map<String, String>> out = new ArrayList<>();
            for (JsonNode item : node.get("skills")) {
                String name = item.path("name").asText("").trim();
                if (name.isEmpty()) continue;
                Map<String, String> skill = new LinkedHashMap<>();
                skill.put("name", name.length() > 80 ? name.substring(0, 80) : name);
                skill.put("category", item.path("category").asText("Other").trim());
                out.add(skill);
            }
            return out;
        } catch (Exception e) {
            log.warn("[llm] resume skill extraction failed: {}", e.getMessage());
            return List.of();
        }
    }

    private static final String SYSTEM_FLASHCARD_PROMPT =
            "You are Leap.ai's flashcard writer. Turn the user's real career roadmap and skills "
            + "into a spaced-repetition study deck: questions a professional preparing for their "
            + "target role must be able to answer from memory. Respond with ONLY valid JSON, no "
            + "markdown, in exactly this shape: {\"cards\": [{\"front\": string, \"back\": string, "
            + "\"topic\": string}]}. Produce 8-12 cards. Front is a short, precise question or prompt "
            + "(one line). Back is the concise answer (2-4 sentences, concrete, from the roadmap "
            + "content and common professional knowledge). Topic is the phase or skill it belongs to. "
            + "Never invent facts that contradict the roadmap content provided; if the roadmap is "
            + "empty, ask the user to complete their profile rather than fabricating a plan.";

    /**
     * Structured flashcard generation from the user's real roadmap + skills.
     * Returns a list of {@code {"front", "back", "topic"}} maps, or an empty
     * list when the LLM is unavailable or the response cannot be parsed (the
     * caller falls back to its deterministic deck builder).
     */
    public List<Map<String, Object>> generateFlashcards(Map<String, Object> roadmap, List<String> skills, String targetRole, Long userId) {
        if (!isConfigured()) {
            return List.of();
        }
        try {
            Map<String, Object> context = new LinkedHashMap<>();
            context.put("roadmap", roadmap);
            context.put("skills", skills);
            context.put("targetRole", targetRole == null ? "" : targetRole);
            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", SYSTEM_FLASHCARD_PROMPT),
                    Map.of("role", "user", "content",
                            "User context (JSON):\n" + objectMapper.writeValueAsString(context)));
            String text = complete(messages, 0.3, 2000, userId, "flashcards");
            JsonNode node = extractJson(text);
            if (node == null || !node.has("cards") || !node.get("cards").isArray()) {
                return List.of();
            }
            List<Map<String, Object>> out = new ArrayList<>();
            for (JsonNode item : node.get("cards")) {
                String front = item.path("front").asText("").trim();
                String back = item.path("back").asText("").trim();
                if (front.isEmpty() || back.isEmpty()) continue;
                Map<String, Object> card = new LinkedHashMap<>();
                card.put("front", front);
                card.put("back", back);
                card.put("topic", item.path("topic").asText("General").trim());
                out.add(card);
                if (out.size() >= 12) break;
            }
            return out;
        } catch (Exception e) {
            log.warn("[llm] flashcard generation failed: {}", e.getMessage());
            return List.of();
        }
    }

    private static final String SYSTEM_RESOURCE_PROMPT =
            "You are Leap.ai's resource cataloger. Given the scraped text of a webpage that is "
            + "candidate learning material, produce structured metadata so it can be added to a "
            + "learning library. Respond with ONLY valid JSON, no markdown, in exactly this shape: "
            + "{\"title\": string, \"description\": string, \"type\": string, \"difficulty\": string, "
            + "\"topics\": [string], \"field\": string}. Rules:\n"
            + "- Base EVERYTHING strictly on the scraped text. Never invent facts, statistics, "
            + "credentials, or claims that are not present in the text. If the text is too thin to "
            + "describe, say what is actually there and nothing more.\n"
            + "- title: a clean, short resource title (under 60 chars) taken from the page — drop "
            + "site suffixes like '· GitHub' or '- Owner/Repo' boilerplate.\n"
            + "- description: 1-2 sentences, concrete, from the text (what it is and who it is for).\n"
            + "- type: exactly one of Course, Guide, Book, Practice, Tool, Docs, Video, Article.\n"
            + "- difficulty: exactly one of beginner, intermediate, advanced — judge from the text.\n"
            + "- topics: 3-5 short topic tags derived from the text.\n"
            + "- field: exactly one of healthcare, tech, marketing, finance, design, sales, general.";

    /**
     * Structured metadata for a scraped resource page: description, type,
     * difficulty, topics, and career field — all derived strictly from the
     * scraped text. Returns {@code null} when the LLM is unavailable or the
     * response cannot be parsed, so the caller falls back to the scraped title
     * and meta description (real data either way — nothing fabricated).
     */
    public Map<String, Object> enrichResource(String scrapedText, Long userId) {
        if (!isConfigured() || scrapedText == null || scrapedText.isBlank()) {
            return null;
        }
        try {
            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", SYSTEM_RESOURCE_PROMPT),
                    Map.of("role", "user", "content",
                            "Scraped page text:\n" + truncate(scrapedText, 8000)));
            String text = complete(messages, 0.2, 600, userId, "resource");
            JsonNode node = extractJson(text);
            if (node == null) return null;
            Map<String, Object> out = new LinkedHashMap<>();
            String title = node.path("title").asText("").trim();
            if (!title.isEmpty()) out.put("title", title.length() > 200 ? title.substring(0, 200) : title);
            String description = node.path("description").asText("").trim();
            if (!description.isEmpty()) out.put("description", description.length() > 500
                    ? description.substring(0, 500) : description);
            String type = node.path("type").asText("").trim();
            if (!type.isEmpty()) out.put("type", type);
            String difficulty = node.path("difficulty").asText("").trim();
            if (!difficulty.isEmpty()) out.put("difficulty", difficulty);
            String field = node.path("field").asText("").trim();
            if (!field.isEmpty()) out.put("field", field);
            List<String> topics = new ArrayList<>();
            for (JsonNode t : node.path("topics")) {
                String topic = t.asText("").trim();
                if (!topic.isEmpty()) topics.add(topic.length() > 40 ? topic.substring(0, 40) : topic);
                if (topics.size() >= 5) break;
            }
            if (!topics.isEmpty()) out.put("topics", topics);
            return out.isEmpty() ? null : out;
        } catch (Exception e) {
            log.warn("[llm] resource enrichment failed: {}", e.getMessage());
            return null;
        }
    }

    /** Pulls a JSON object out of a model response, tolerating markdown fences. */
    private JsonNode extractJson(String text) {
        if (text == null) return null;
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start < 0 || end <= start) return null;
        try {
            return objectMapper.readTree(text.substring(start, end + 1));
        } catch (Exception e) {
            log.warn("[llm] could not parse structured response: {}", e.getMessage());
            return null;
        }
    }

    private String complete(List<Map<String, Object>> messages) throws Exception {
        return complete(messages, 0.7, 2000, null, null);
    }

    private String complete(List<Map<String, Object>> messages, double temperature, int maxTokens) throws Exception {
        return complete(messages, temperature, maxTokens, null, null);
    }

    private String complete(List<Map<String, Object>> messages, double temperature, int maxTokens,
                            Long userId, String purpose) throws Exception {
        Map<String, Object> payload = Map.of(
                "model", model,
                "messages", messages,
                "temperature", temperature,
                "max_tokens", maxTokens);
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
        if (userId != null && purpose != null) {
            recordUsage(userId, purpose, node);
        }
        String content = node.path("choices").path(0).path("message").path("content").asText();
        if (content.isBlank()) {
            throw new IllegalStateException("LLM API returned empty content");
        }
        return content;
    }

    /** Persist per-user token usage from the API response (used for the usage
     *  breakdown in Settings). Free-model calls are recorded too — the token
     *  counts are real even when the cost is zero. */
    private void recordUsage(Long userId, String purpose, JsonNode node) {
        try {
            JsonNode usage = node.path("usage");
            long prompt = usage.path("prompt_tokens").asLong(0);
            long completion = usage.path("completion_tokens").asLong(0);
            long total = usage.path("total_tokens").asLong(0);
            if (prompt <= 0 && completion <= 0 && total <= 0) return;
            TokenUsage t = new TokenUsage();
            t.setUserId(userId);
            t.setPurpose(purpose);
            t.setModel(model);
            t.setPromptTokens(prompt);
            t.setCompletionTokens(completion);
            t.setTotalTokens(total > 0 ? total : prompt + completion);
            tokenUsage.save(t);
        } catch (Exception e) {
            log.debug("[llm] could not record usage: {}", e.getMessage());
        }
    }

    private static String truncate(String value, int max) {
        return value == null ? "" : value.length() <= max ? value : value.substring(0, max) + "…";
    }
}
