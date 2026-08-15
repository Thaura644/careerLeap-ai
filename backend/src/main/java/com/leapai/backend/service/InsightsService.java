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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Insights are derived from the user's real data — their profile, roadmap,
 * goals, and the library — never invented. A generated roadmap is persisted so
 * the dashboard and chat can reference it later.
 */
@Service
public class InsightsService {

    private final LlmService llmService;
    private final RoadmapRepository roadmaps;
    private final GoalRepository goals;
    private final ResourceRepository resources;
    private final ObjectMapper objectMapper;

    public InsightsService(LlmService llmService, RoadmapRepository roadmaps, GoalRepository goals,
                           ResourceRepository resources, ObjectMapper objectMapper) {
        this.llmService = llmService;
        this.roadmaps = roadmaps;
        this.goals = goals;
        this.resources = resources;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> insights(User user) {
        Map<String, Object> result = new LinkedHashMap<>();

        Roadmap roadmap = roadmaps.findFirstByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
        List<Goal> userGoals = goals.findByUserIdOrderByCreatedAtAsc(user.getId());

        result.put("topSkillGap", topSkillGap(user, roadmap));
        result.put("marketTrend", marketTrend());
        result.put("recommendedPath", recommendedPath(roadmap, userGoals));
        result.put("hasRoadmap", roadmap != null);
        return result;
    }

    @Transactional
    public Map<String, Object> generateRoadmap(User user, Map<String, Object> profile) {
        Map<String, Object> merged = new LinkedHashMap<>(profile);
        // Fall back to the saved profile when the request omits fields.
        merged.putIfAbsent("currentRole", nvl(user.getCurrentRole(), "Your current role"));
        merged.putIfAbsent("targetRole", nvl(user.getTargetRole(), "Your target role"));
        merged.putIfAbsent("timeframe", nvl(user.getTimeframe(), "12 months"));
        merged.putIfAbsent("industry", nvl(user.getIndustry(), ""));
        merged.putIfAbsent("focusAreas", List.of());
        // Learning preferences shape the roadmap's pace and resource mix.
        merged.putIfAbsent("learningFormats", nvl(user.getLearningFormats(), ""));
        merged.putIfAbsent("weeklyCommitment", nvl(user.getWeeklyCommitment(), ""));
        merged.putIfAbsent("learningStyle", nvl(user.getLearningStyle(), ""));

        Map<String, Object> generated = llmService.generateRoadmap(merged);

        Roadmap roadmap = new Roadmap();
        roadmap.setUserId(user.getId());
        roadmap.setCurrentRole(String.valueOf(merged.get("currentRole")));
        roadmap.setTargetRole(String.valueOf(merged.get("targetRole")));
        roadmap.setTimeframe(String.valueOf(merged.getOrDefault("timeframe", "12 months")));
        Object focus = merged.get("focusAreas");
        roadmap.setFocusAreas(focus instanceof List
                ? String.join(", ", (List<String>) focus)
                : String.valueOf(focus == null ? "" : focus));
        roadmap.setSource(String.valueOf(generated.get("source")));
        try {
            roadmap.setContent(objectMapper.writeValueAsString(generated.get("roadmap")));
        } catch (Exception e) {
            roadmap.setContent("{}");
        }
        roadmaps.save(roadmap);

        Map<String, Object> result = new LinkedHashMap<>(generated);
        result.put("roadmapId", roadmap.getId());
        return result;
    }

    /** Real recommendations from the library catalog, scored against the user's profile. */
    public Map<String, Object> recommendations(User user) {
        Roadmap roadmap = roadmaps.findFirstByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
        String target = roadmap == null ? nvl(user.getTargetRole(), "") : roadmap.getTargetRole();
        String current = roadmap == null ? nvl(user.getCurrentRole(), "") : roadmap.getCurrentRole();

        // Boost items whose type matches the user's preferred learning formats.
        java.util.Set<String> preferred = preferredTypes(user.getLearningFormats());

        List<Resource> catalog = resources.findAll();
        List<Map<String, Object>> ranked = new ArrayList<>();
        for (Resource r : catalog) {
            double score = score(r, target, current);
            if (preferred.contains(r.getType().toLowerCase(Locale.ROOT))) score += 15;
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", String.valueOf(r.getId()));
            dto.put("title", r.getTitle());
            dto.put("source", r.getType().toLowerCase(Locale.ROOT));
            dto.put("url", "/resources");
            dto.put("description", r.getDescription());
            dto.put("difficulty", r.isPro() ? "advanced" : "intermediate");
            dto.put("estimatedTime", r.getDuration());
            dto.put("relevanceScore", Math.round(score * 100.0) / 100.0);
            ranked.add(dto);
        }
        ranked.sort(Comparator.comparingDouble(
                (Map<String, Object> dto) -> ((Number) dto.get("relevanceScore")).doubleValue()).reversed());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("recommendations", ranked.stream().limit(6).collect(java.util.stream.Collectors.toList()));
        return result;
    }

    private double score(Resource r, String target, String current) {
        String text = (r.getTitle() + " " + nvl(r.getDescription(), "")).toLowerCase(Locale.ROOT);
        double score = r.getRating() * 10.0;
        String all = (target + " " + current).toLowerCase(Locale.ROOT);
        if (all.contains("design") && text.contains("design")) score += 25;
        if (all.contains("lead") && (text.contains("lead") || text.contains("management"))) score += 25;
        if (all.contains("data") && text.contains("data")) score += 25;
        if (all.contains("product") && text.contains("product")) score += 25;
        if (all.contains("architect") && (text.contains("architect") || text.contains("system"))) score += 25;
        if (all.contains("interview") && text.contains("interview")) score += 25;
        if (all.contains("communic") && text.contains("communic")) score += 25;
        return score;
    }

    /** Maps the user's preferred learning formats to library resource types. */
    private java.util.Set<String> preferredTypes(String formats) {
        java.util.Set<String> out = new java.util.HashSet<>();
        if (formats == null || formats.isBlank()) return out;
        for (String f : formats.split(",")) {
            switch (f.trim().toLowerCase(Locale.ROOT)) {
                case "video courses": out.add("course"); break;
                case "books & documentation": out.add("ebook"); out.add("guide"); break;
                case "articles & blog posts": out.add("guide"); break;
                case "podcasts": out.add("podcast"); break;
                case "live workshops & webinars": out.add("workshop"); out.add("webinar"); break;
                default: break;
            }
        }
        return out;
    }

    private String topSkillGap(User user, Roadmap roadmap) {
        String target = roadmap == null ? nvl(user.getTargetRole(), "") : roadmap.getTargetRole();
        String t = target.toLowerCase(Locale.ROOT);
        if (t.contains("staff") || t.contains("principal")) return "Cross-team technical influence";
        if (t.contains("manager") || t.contains("management") || t.contains("lead")) {
            return "People leadership and delegation";
        }
        if (t.contains("architect")) return "System design and trade-off analysis";
        if (t.contains("data")) return "Statistical thinking and data storytelling";
        if (t.contains("product")) return "Prioritization and stakeholder alignment";
        return "A focused skill bridge to " + target;
    }

    private String marketTrend() {
        // Honest: no external market data feed is wired yet, so surface a real
        // signal from the library instead of inventing an industry statistic.
        List<Resource> catalog = resources.findAll();
        if (catalog.isEmpty()) return "The library is being stocked — check back soon.";
        Resource top = catalog.stream()
                .max(Comparator.comparingDouble(Resource::getRating))
                .orElse(catalog.get(0));
        return "Highest-rated in the library right now: \"" + top.getTitle() + "\" ("
                + top.getRating() + "/5, " + top.getReviews() + " reviews).";
    }

    private List<String> recommendedPath(Roadmap roadmap, List<Goal> userGoals) {
        List<String> path = new ArrayList<>();
        if (roadmap != null) {
            try {
                Map<String, Object> content = objectMapper.readValue(roadmap.getContent(),
                        new TypeReference<Map<String, Object>>() {});
                Object phasesObj = content.get("phases");
                if (phasesObj instanceof List && !((List<?>) phasesObj).isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> first = (Map<String, Object>) ((List<?>) phasesObj).get(0);
                    Object milestones = first.get("milestones");
                    if (milestones instanceof List) {
                        for (Object m : (List<?>) milestones) {
                            path.add(String.valueOf(m));
                            if (path.size() >= 3) break;
                        }
                    }
                }
            } catch (Exception ignored) {
                // fall through to goals below
            }
        }
        if (path.isEmpty()) {
            for (Goal g : userGoals) {
                path.add(g.getTitle());
                if (path.size() >= 3) break;
            }
        }
        if (path.isEmpty()) {
            path.add("Generate your roadmap from your profile");
            path.add("Complete the Phase 1 skill-gap assessment");
            path.add("Bookmark two resources and start one");
        }
        return path;
    }

    private static String nvl(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
