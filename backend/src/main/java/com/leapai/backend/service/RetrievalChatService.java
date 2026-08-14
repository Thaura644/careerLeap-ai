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

    public RetrievalChatService(RoadmapRepository roadmaps, GoalRepository goals,
                                ResourceRepository resources, ObjectMapper objectMapper) {
        this.roadmaps = roadmaps;
        this.goals = goals;
        this.resources = resources;
        this.objectMapper = objectMapper;
    }

    public String respond(String prompt, Long userId) {
        String input = prompt == null ? "" : prompt.toLowerCase(Locale.ROOT);
        String targetRole = targetRole(userId);

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
        return "I can help with what I can see in your account: your roadmap, your goals, and the "
                + "learning library. Try asking about your roadmap, setting a goal, or finding resources "
                + "for a specific skill.";
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
