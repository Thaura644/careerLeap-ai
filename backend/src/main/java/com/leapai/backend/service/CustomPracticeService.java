package com.leapai.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.config.ForbiddenException;
import com.leapai.backend.model.CustomPracticeItem;
import com.leapai.backend.model.CustomPracticeSubmission;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.CustomPracticeItemRepository;
import com.leapai.backend.repository.CustomPracticeSubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The real practice-generation engine: every exercise is built by the LLM
 * from the signed-in user's actual profile (role, target role, industry,
 * aspirations) — not picked from a fixed catalog, and not assumed to be a
 * coding problem. Grading is likewise real, against the exercise's own
 * evaluation criteria, not a rule-based checker.
 */
@Service
public class CustomPracticeService {

    private final CustomPracticeItemRepository items;
    private final CustomPracticeSubmissionRepository submissions;
    private final LlmService llm;
    private final CreditService credits;
    private final ObjectMapper objectMapper;

    public CustomPracticeService(CustomPracticeItemRepository items, CustomPracticeSubmissionRepository submissions,
                                  LlmService llm, CreditService credits, ObjectMapper objectMapper) {
        this.items = items;
        this.submissions = submissions;
        this.llm = llm;
        this.credits = credits;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Map<String, Object> generate(User user) {
        if (!credits.consume(user, CreditService.Action.CUSTOM_PRACTICE)) {
            throw new ForbiddenException("Out of credits for this month — upgrade to Pro for unlimited practice generation.");
        }

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("currentRole", user.getCurrentRole());
        profile.put("targetRole", user.getTargetRole());
        profile.put("industry", user.getIndustry());
        profile.put("yearsExperience", user.getYearsExperience());
        profile.put("timeframe", user.getTimeframe());
        profile.put("aspirations", user.getAspirations());
        profile.put("interests", user.getInterests());

        Map<String, Object> generated = llm.generateCustomPractice(profile, user.getId());
        if (!"llm".equals(generated.get("source"))) {
            throw new IllegalStateException(String.valueOf(generated.getOrDefault("error", "Could not generate a practice exercise.")));
        }

        CustomPracticeItem item = new CustomPracticeItem();
        item.setUserId(user.getId());
        item.setType(String.valueOf(generated.get("type")));
        item.setTitle(String.valueOf(generated.get("title")));
        item.setPrompt(String.valueOf(generated.get("prompt")));
        item.setContext(String.valueOf(generated.getOrDefault("context", "")));
        item.setExpectedFormat(String.valueOf(generated.getOrDefault("expectedFormat", "")));
        item.setEvaluationCriteriaJson(toJson(generated.get("evaluationCriteria")));
        items.save(item);

        return itemDto(item, null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(User user) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (CustomPracticeItem item : items.findByUserIdOrderByCreatedAtDesc(user.getId())) {
            CustomPracticeSubmission latest = submissions.findFirstByItemIdOrderByCreatedAtDesc(item.getId()).orElse(null);
            out.add(itemDto(item, latest));
        }
        return out;
    }

    @Transactional
    public Map<String, Object> submit(Long itemId, User user, String responseText) {
        CustomPracticeItem item = items.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Practice item not found"));
        String trimmed = responseText == null ? "" : responseText.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Your response can't be empty.");
        }

        List<String> criteria = fromJsonList(item.getEvaluationCriteriaJson());
        Map<String, Object> feedback = llm.evaluateCustomPracticeSubmission(
                item.getTitle(), item.getPrompt(), criteria, trimmed, user.getId());

        CustomPracticeSubmission submission = new CustomPracticeSubmission();
        submission.setItemId(item.getId());
        submission.setUserId(user.getId());
        submission.setResponseText(trimmed);

        if ("llm".equals(feedback.get("source"))) {
            Object scoreObj = feedback.get("score");
            int score = scoreObj instanceof Number ? ((Number) scoreObj).intValue() : -1;
            submission.setScore(score >= 0 ? score : null);
            submission.setOverallFeedback(String.valueOf(feedback.getOrDefault("overallFeedback", "")));
            submission.setStrengthsJson(toJson(feedback.get("strengths")));
            submission.setGapsJson(toJson(feedback.get("gaps")));
        } else {
            // Submission is still saved (the user's work is never lost) —
            // just ungraded. The DTO reports gradingError so the UI can offer
            // a retry instead of showing fake feedback.
            submission.setOverallFeedback(null);
        }
        submissions.save(submission);

        Map<String, Object> dto = itemDto(item, submission);
        if (!"llm".equals(feedback.get("source"))) {
            dto.put("gradingError", feedback.getOrDefault("error", "Could not grade this submission."));
        }
        return dto;
    }

    private Map<String, Object> itemDto(CustomPracticeItem item, CustomPracticeSubmission submission) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", item.getId());
        dto.put("type", item.getType());
        dto.put("title", item.getTitle());
        dto.put("prompt", item.getPrompt());
        dto.put("context", item.getContext());
        dto.put("expectedFormat", item.getExpectedFormat());
        dto.put("evaluationCriteria", fromJsonList(item.getEvaluationCriteriaJson()));
        dto.put("createdAt", item.getCreatedAt());
        if (submission != null) {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("responseText", submission.getResponseText());
            s.put("score", submission.getScore());
            s.put("overallFeedback", submission.getOverallFeedback());
            s.put("strengths", fromJsonList(submission.getStrengthsJson()));
            s.put("gaps", fromJsonList(submission.getGapsJson()));
            s.put("createdAt", submission.getCreatedAt());
            dto.put("submission", s);
        }
        return dto;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? List.of() : value);
        } catch (Exception e) {
            return "[]";
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> fromJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception e) {
            return List.of();
        }
    }
}
