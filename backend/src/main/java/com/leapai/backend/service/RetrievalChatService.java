package com.leapai.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.model.Goal;
import com.leapai.backend.model.Resource;
import com.leapai.backend.model.Roadmap;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.GoalRepository;
import com.leapai.backend.repository.ResourceRepository;
import com.leapai.backend.repository.RoadmapRepository;
import com.leapai.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Real, grounded chat fallback used when no LLM key is configured. Answers
 * from the user's actual data — their latest roadmap, their goals, and the
 * library catalog — never from canned phrases, and it says plainly when it
 * doesn't have an answer rather than inventing one.
 */
@Service
public class RetrievalChatService {

    private final RoadmapRepository roadmaps;
    private final GoalRepository goals;
    private final ResourceRepository resources;
    private final ObjectMapper objectMapper;
    private final AiContextService aiContext;
    private final UserRepository users;

    public RetrievalChatService(RoadmapRepository roadmaps, GoalRepository goals,
                                ResourceRepository resources, ObjectMapper objectMapper,
                                AiContextService aiContext, UserRepository users) {
        this.roadmaps = roadmaps;
        this.goals = goals;
        this.resources = resources;
        this.objectMapper = objectMapper;
        this.aiContext = aiContext;
        this.users = users;
    }

    public String respond(String prompt, Long userId) {
        String input = prompt == null ? "" : prompt.toLowerCase(Locale.ROOT);
        String targetRole = targetRole(userId);

        // The assistant can act on the user's data when asked: create a goal,
        // update a profile field, or mark a resource complete.
        String actionResult = tryAction(input, userId);
        if (actionResult != null) {
            return actionResult;
        }

        // "What do you know about me" — surface the real context payload.
        if (input.contains("know about me") || input.contains("what do you know")
                || input.contains("my profile") || input.contains("my data")) {
            return contextAnswer(userId);
        }

        if (input.contains("roadmap") || input.contains("plan") || input.contains("next step")
                || input.contains("phase") || input.contains("path")) {
            return roadmapAnswer(userId, targetRole);
        }
        if (input.contains("goal")) {
            return goalAnswer(userId);
        }
        if (input.contains("resource") || input.contains("recommend") || input.contains("learn")
                || input.contains("course")) {
            return resourceAnswer(input);
        }
        if (input.contains("interview")) {
            return "For " + (targetRole == null ? "your target role" : targetRole)
                    + " interviews, focus on: (1) one systems/craft deep-dive that shows your current level, "
                    + "(2) 3–5 STAR-format stories from work you've actually shipped, and (3) asking the "
                    + "interviewer sharp questions about scope and ownership. Do 3+ mock interviews and "
                    + "debrief every one. Add \"interview\" to a question and I'll go deeper.";
        }
        if (input.contains("skill") || input.contains("gap") || input.contains("what should")) {
            return "Your roadmap defines the priority gaps. Open it and start with Phase 1's assessment: "
                    + "score yourself 1–5 against the real requirements of "
                    + (targetRole == null ? "your target role" : targetRole)
                    + ", then attack your two weakest scores first. Want me to list the catalog resources "
                    + "that match a specific skill? Ask \"recommend resources for <skill>\".";
        }
        return "I can help with what I can see in your account: your profile, roadmap, goals, and "
                + "practice progress. Ask me to do things too — like \"add a goal: pass the AWS "
                + "exam\", \"set my target role to Staff Engineer\", or \"mark the System Design "
                + "Primer complete\" — and I'll actually do them and save the result.";
    }

    /**
     * Recognize safe, explicit action requests and execute them against the
     * user's real data. Returns the confirmation reply, or null when the
     * message is not an action request (the normal answer path continues).
     */
    private String tryAction(String input, Long userId) {
        // add a goal: <title> / create a goal to <title>
        String goalTitle = null;
        if (input.contains("add a goal") || input.contains("create a goal")
                || input.contains("new goal")) {
            goalTitle = after(input, "add a goal", ":");
            if (goalTitle == null) goalTitle = after(input, "create a goal", ":");
            if (goalTitle == null) goalTitle = after(input, "new goal", ":");
            if (goalTitle == null) goalTitle = after(input, "add a goal", "to");
            if (goalTitle == null) goalTitle = after(input, "create a goal", "to");
        }
        if (goalTitle != null && !goalTitle.isBlank()) {
            Map<String, Object> action = Map.of("action", "create_goal", "title", goalTitle);
            return aiContext.execute(userId, action);
        }

        // set my target role to X / change my target role to X
        if (input.contains("target role")
                && (input.contains("set") || input.contains("change") || input.contains("update")
                || input.contains("make"))) {
            String value = after(input, "target role", "to");
            if (value != null && !value.isBlank()) {
                Map<String, Object> action = Map.of("action", "update_profile", "targetRole", value);
                return aiContext.execute(userId, action);
            }
        }
        if (input.contains("current role")
                && (input.contains("set") || input.contains("change") || input.contains("update"))) {
            String value = after(input, "current role", "to");
            if (value != null && !value.isBlank()) {
                Map<String, Object> action = Map.of("action", "update_profile", "currentRole", value);
                return aiContext.execute(userId, action);
            }
        }

        // mark <title> complete / mark complete: <title>
        if ((input.contains("mark") && input.contains("complete"))
                || (input.contains("mark complete") && input.contains(":"))) {
            String title = between(input, "mark", "complete");
            if (title == null) title = after(input, "mark complete", ":");
            if (title != null && !title.isBlank()) {
                Map<String, Object> action = Map.of("action", "mark_complete", "title", title);
                return aiContext.execute(userId, action);
            }
        }
        return null;
    }

    private String contextAnswer(Long userId) {
        Map<String, Object> ctx = aiContext.context(userId);
        @SuppressWarnings("unchecked")
        Map<String, Object> profile = (Map<String, Object>) ctx.getOrDefault("profile", Map.of());
        StringBuilder sb = new StringBuilder("Here's what I can see in your account:\n");
        sb.append("• ").append(profile.getOrDefault("name", "")).append(" — ")
                .append(profile.getOrDefault("currentRole", "")).append(" → ")
                .append(profile.getOrDefault("targetRole", "")).append("\n");
        if (!String.valueOf(profile.getOrDefault("timeframe", "")).isBlank()) {
            sb.append("• Timeline: ").append(profile.get("timeframe")).append("\n");
        }
        Object roadmap = ctx.get("roadmap");
        if (roadmap instanceof Map) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> phases = (List<Map<String, Object>>) ((Map<String, Object>) roadmap)
                    .getOrDefault("phases", List.of());
            sb.append("• Roadmap: ").append(phases.size()).append(" phases (");
            for (int i = 0; i < Math.min(2, phases.size()); i++) {
                if (i > 0) sb.append(", ");
                sb.append(phases.get(i).getOrDefault("title", ""));
            }
            sb.append(phases.size() > 2 ? "…)" : ")").append("\n");
        }
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> goalList = (List<Map<String, Object>>) ctx.getOrDefault("goals", List.of());
        sb.append("• Goals: ").append(goalList.size()).append(" saved\n");
        @SuppressWarnings("unchecked")
        Map<String, Object> practice = (Map<String, Object>) ctx.getOrDefault("practice", Map.of());
        sb.append("• Practice: ").append(practice.getOrDefault("solved", 0)).append("/")
                .append(practice.getOrDefault("total", 0)).append(" problems solved\n");
        sb.append("I can update any of this for you — just ask.");
        return sb.toString();
    }

    /** Text between an anchor and a following delimiter, e.g. between
     *  "mark" and "complete" in "mark the primer complete" → "the primer". */
    private static String between(String input, String anchor, String delimiter) {
        int start = input.indexOf(anchor);
        if (start < 0) return null;
        start += anchor.length();
        int end = input.indexOf(delimiter, start);
        if (end < 0) return null;
        String value = input.substring(start, end).trim();
        return value.isEmpty() ? null : value;
    }

    /** Text after the last occurrence of {@code anchor} and one of the given
     *  delimiters (or end of string). Case-insensitive; returns trimmed. */
    private static String after(String input, String anchor, String delimiter) {
        int idx = input.indexOf(anchor);
        if (idx < 0) return null;
        int start = idx + anchor.length();
        if (delimiter != null) {
            int d = input.indexOf(delimiter, start);
            if (d >= 0) start = d + delimiter.length();
        }
        String value = input.substring(start).trim();
        return value.isEmpty() ? null : value;
    }

    private String roadmapAnswer(Long userId, String targetRole) {
        Optional<Roadmap> latest = roadmaps.findFirstByUserIdOrderByCreatedAtDesc(userId);
        if (latest.isEmpty()) {
            return "You don't have a roadmap yet. Generate one from your profile (current role → target "
                    + "role) and I'll be able to walk you through it phase by phase.";
        }
        Roadmap roadmap = latest.get();
        StringBuilder sb = new StringBuilder("Here's your roadmap (" + roadmap.getSource()
                + "-generated, " + roadmap.getCreatedAt().toString().substring(0, 10) + "):\n");
        try {
            Map<String, Object> content = objectMapper.readValue(roadmap.getContent(),
                    new TypeReference<Map<String, Object>>() {});
            Object phasesObj = content.get("phases");
            if (phasesObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> phases = (List<Map<String, Object>>) phasesObj;
                for (int i = 0; i < Math.min(3, phases.size()); i++) {
                    Map<String, Object> p = phases.get(i);
                    sb.append("• ").append(p.getOrDefault("title", "Phase"))
                            .append(" (").append(p.getOrDefault("duration", "")).append("): ")
                            .append(p.getOrDefault("focus", "")).append("\n");
                }
                if (phases.size() > 3) {
                    sb.append("…and ").append(phases.size() - 3).append(" more phases.\n");
                }
            }
        } catch (Exception e) {
            sb.append("• ").append(roadmap.getCurrentRole()).append(" → ")
                    .append(roadmap.getTargetRole()).append(" (details unavailable)\n");
        }
        sb.append("Ask me about a specific phase or skill for concrete next steps.");
        return sb.toString();
    }

    private String goalAnswer(Long userId) {
        List<Goal> userGoals = goals.findByUserIdOrderByCreatedAtAsc(userId);
        if (userGoals.isEmpty()) {
            return "You don't have any goals saved yet. Add one (e.g. \"Pass the AWS Solutions Architect "
                    + "exam\") and it'll show up here for tracking.";
        }
        StringBuilder sb = new StringBuilder("Your goals:\n");
        for (Goal g : userGoals) {
            sb.append("• ").append(g.getTitle()).append(" — ").append(g.getStatus())
                    .append(" (").append(g.getProgress()).append("%)\n");
        }
        sb.append("I can help you break one down into weekly deliverables — just name it.");
        return sb.toString();
    }

    private String resourceAnswer(String input) {
        List<Resource> catalog = resources.findAll();
        if (catalog.isEmpty()) {
            return "The library is empty right now — check back soon.";
        }
        List<Resource> matches = catalog.stream()
                .filter(r -> input.contains(r.getTitle().toLowerCase(Locale.ROOT).substring(0,
                        Math.min(12, r.getTitle().length()))))
                .collect(Collectors.toList());
        List<Resource> ranked = matches.isEmpty() ? catalog : matches;
        ranked.sort(Comparator.comparingDouble(Resource::getRating).reversed());

        StringBuilder sb = new StringBuilder("Top picks from the library:\n");
        for (Resource r : ranked.stream().limit(3).collect(Collectors.toList())) {
            sb.append("• ").append(r.getTitle()).append(" — ").append(r.getType())
                    .append(", rated ").append(r.getRating()).append("/5 (")
                    .append(r.getDuration()).append(")")
                    .append(r.isPro() ? " [Pro]" : "").append("\n");
        }
        return sb.toString();
    }

    private String targetRole(Long userId) {
        // Target role lives on the latest roadmap; the User entity profile may lag.
        return roadmaps.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .map(Roadmap::getTargetRole).orElse(null);
    }
}
