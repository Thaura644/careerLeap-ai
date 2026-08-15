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

    /**
     * Real recommendations from the library catalog, scored by a multi-signal
     * engine against the user's real profile: role relevance, skill-gap match,
     * learning-format preference, difficulty fit, popularity, and trending.
     * Each signal is normalized 0..1 and weighted; the composite score is
     * explainable (every item carries the reasons it won), and the top list is
     * diversified so one format can't dominate.
     */
    public Map<String, Object> recommendations(User user) {
        Roadmap roadmap = roadmaps.findFirstByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
        String target = roadmap == null ? nvl(user.getTargetRole(), "") : roadmap.getTargetRole();
        String current = roadmap == null ? nvl(user.getCurrentRole(), "") : roadmap.getCurrentRole();
        List<String> interests = csvList(user.getInterests());
        java.util.Set<String> preferred = preferredTypes(user.getLearningFormats());
        double experience = yearsExperience(user.getYearsExperience());
        int maxReviews = 0;
        for (Resource r : resources.findAll()) maxReviews = Math.max(maxReviews, r.getReviews());

        List<Resource> catalog = resources.findAll();
        List<ScoredResource> scored = new ArrayList<>();
        for (Resource r : catalog) {
            String text = (r.getTitle() + " " + nvl(r.getDescription(), "") + " " + r.getType()
                    + " " + r.getCategory()).toLowerCase(Locale.ROOT);

            double roleRelevance = roleRelevance(text, target, current);
            double skillGap = skillGap(text, interests);
            double format = preferred.contains(r.getType().toLowerCase(Locale.ROOT)) ? 1.0 : 0.0;
            double difficulty = difficultyFit(r.isPro(), experience);
            double popularity = popularity(r.getRating(), r.getReviews(), maxReviews);
            double trending = "TRENDING".equalsIgnoreCase(r.getCategory()) ? 1.0 : 0.0;

            // Weights sum to 1.0: profile-first, then engagement signals.
            double score = 100.0 * (0.30 * roleRelevance
                    + 0.25 * skillGap
                    + 0.15 * format
                    + 0.10 * difficulty
                    + 0.10 * popularity
                    + 0.10 * trending);

            List<String> reasons = reasons(r, roleRelevance, skillGap, format, trending);

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", String.valueOf(r.getId()));
            dto.put("title", r.getTitle());
            dto.put("source", r.getType().toLowerCase(Locale.ROOT));
            dto.put("url", "/resources");
            dto.put("description", r.getDescription());
            dto.put("difficulty", r.isPro() ? "advanced" : "intermediate");
            dto.put("estimatedTime", r.getDuration());
            dto.put("relevanceScore", Math.round(score * 100.0) / 100.0);
            dto.put("reasons", reasons);
            scored.add(new ScoredResource(dto, score, r.getType().toLowerCase(Locale.ROOT)));
        }

        scored.sort(Comparator.comparingDouble((ScoredResource s) -> s.score).reversed());
        List<Map<String, Object>> diverse = diversify(scored, 6, 2);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("recommendations", diverse);
        result.put("explanation", "Scored by role relevance (30%), skill-gap match (25%), "
                + "learning format (15%), difficulty fit (10%), popularity (10%), and trending (10%).");
        return result;
    }

    /** Role relevance: how much of the target+current role's vocabulary is in
     *  the item. Each distinct role keyword that appears earns credit, so one
     *  strong match ("engineer" for a Staff Engineer target) is meaningful
     *  instead of being diluted by the generic words around it. */
    private double roleRelevance(String text, String target, String current) {
        String all = (target + " " + current).toLowerCase(Locale.ROOT);
        String[] words = all.split("[^a-z]+");
        java.util.Set<String> seen = new java.util.HashSet<>();
        int hits = 0;
        for (String w : words) {
            if (w.length() < 4) continue;
            if (!seen.add(w)) continue;
            if (text.contains(w)) hits++;
        }
        if (seen.isEmpty()) return 0.3; // no role vocabulary yet — mild neutral signal
        return Math.min(1.0, hits * 0.4);
    }

    /** Skill-gap match: the fraction of the user's self-assessed skills covered. */
    private double skillGap(String text, List<String> interests) {
        if (interests.isEmpty()) return 0.0;
        int hits = 0;
        for (String skill : interests) {
            if (skill.length() < 3) continue;
            if (text.contains(skill.toLowerCase(Locale.ROOT))) hits++;
        }
        return Math.min(1.0, hits / (double) Math.min(4, interests.size()));
    }

    /** Difficulty fit: senior users get advanced/pro content, juniors get foundations. */
    private double difficultyFit(boolean isPro, double experienceYears) {
        if (experienceYears < 0) return 0.5; // unknown experience — neutral
        if (experienceYears >= 6) return isPro ? 1.0 : 0.4;
        if (experienceYears >= 3) return isPro ? 0.6 : 0.8;
        return isPro ? 0.2 : 1.0; // junior
    }

    /** Popularity: rating weighted by review count, log-scaled so one hit item
     *  can't drown out everything else, normalized against the catalog max. */
    private double popularity(double rating, int reviews, int maxReviews) {
        double ratingPart = rating / 5.0;
        double reviewPart = maxReviews <= 0 ? 0 : Math.log(1 + reviews) / Math.log(1 + maxReviews);
        return 0.5 * ratingPart + 0.5 * reviewPart;
    }

    /** Human-readable "why this item" reasons for the UI. */
    private List<String> reasons(Resource r, double role, double skill, double format, double trending) {
        List<String> reasons = new ArrayList<>();
        if (role >= 0.66) reasons.add("Strong match for your target role");
        else if (role >= 0.33) reasons.add("Relevant to your career path");
        if (skill >= 0.33) reasons.add("Covers skills you're building");
        if (format > 0) reasons.add("Matches your preferred learning format");
        if (trending > 0) reasons.add("Trending in the library");
        if (reasons.isEmpty()) reasons.add("Highly rated in the library");
        return reasons;
    }

    /** Greedy diversity: at most {@code maxPerType} items of each format in the
     *  final list, keeping the best-scored items of each format. */
    private List<Map<String, Object>> diversify(List<ScoredResource> scored, int limit, int maxPerType) {
        java.util.Map<String, Integer> counts = new java.util.HashMap<>();
        List<Map<String, Object>> out = new ArrayList<>();
        for (ScoredResource s : scored) {
            int used = counts.getOrDefault(s.type, 0);
            if (used >= maxPerType) continue;
            counts.put(s.type, used + 1);
            out.add(s.dto);
            if (out.size() >= limit) break;
        }
        return out;
    }

    private static final class ScoredResource {
        final Map<String, Object> dto;
        final double score;
        final String type;
        ScoredResource(Map<String, Object> dto, double score, String type) {
            this.dto = dto;
            this.score = score;
            this.type = type;
        }
    }

    /** Parses "0-2" / "3-5" / "6-10" / "10+" style experience strings. */
    private double yearsExperience(String value) {
        if (value == null || value.isBlank()) return -1;
        String[] parts = value.replace("+", "").split("[^0-9]+");
        for (String part : parts) {
            if (part.isEmpty()) continue;
            return Double.parseDouble(part);
        }
        return -1;
    }

    private List<String> csvList(String value) {
        List<String> out = new ArrayList<>();
        if (value == null || value.isBlank()) return out;
        for (String part : value.split(",")) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) out.add(trimmed.toLowerCase(Locale.ROOT));
        }
        return out;
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
