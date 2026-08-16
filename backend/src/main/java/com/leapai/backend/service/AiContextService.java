package com.leapai.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.model.Goal;
import com.leapai.backend.model.Resource;
import com.leapai.backend.model.Roadmap;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.GoalRepository;
import com.leapai.backend.repository.ProblemRepository;
import com.leapai.backend.repository.ResourceProgressRepository;
import com.leapai.backend.repository.ResourceRepository;
import com.leapai.backend.repository.RoadmapRepository;
import com.leapai.backend.repository.SubmissionRepository;
import com.leapai.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * The AI's view of the user. Builds a compact, real "what I know about you"
 * payload (profile, roadmap phases, goals, practice + resource progress) that
 * the chat injects as grounding, and executes a small set of safe, concrete
 * actions the assistant can perform on the user's behalf when asked — create a
 * goal, update a profile field, or mark a resource complete. Everything is
 * persisted server-side, never fabricated.
 */
@Service
public class AiContextService {

    private final UserRepository users;
    private final RoadmapRepository roadmaps;
    private final GoalRepository goals;
    private final SubmissionRepository submissions;
    private final ProblemRepository problems;
    private final ResourceRepository resources;
    private final ResourceProgressRepository resourceProgress;
    private final ObjectMapper objectMapper;

    public AiContextService(UserRepository users, RoadmapRepository roadmaps, GoalRepository goals,
                            SubmissionRepository submissions, ProblemRepository problems,
                            ResourceRepository resources, ResourceProgressRepository resourceProgress,
                            ObjectMapper objectMapper) {
        this.users = users;
        this.roadmaps = roadmaps;
        this.goals = goals;
        this.submissions = submissions;
        this.problems = problems;
        this.resources = resources;
        this.resourceProgress = resourceProgress;
        this.objectMapper = objectMapper;
    }

    /** Compact context payload for the given user id. Never throws — the AI
     *  must work even when the account is brand new. */
    @Transactional(readOnly = true)
    public Map<String, Object> context(Long userId) {
        User user = users.findById(userId).orElse(null);
        Map<String, Object> ctx = new LinkedHashMap<>();
        if (user == null) {
            ctx.put("profile", Map.of());
            ctx.put("roadmap", null);
            ctx.put("goals", List.of());
            ctx.put("practice", Map.of("solved", 0, "total", 0));
            ctx.put("resourcesCompleted", 0);
            return ctx;
        }

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("name", user.getFullName());
        profile.put("currentRole", nz(user.getCurrentRole()));
        profile.put("targetRole", nz(user.getTargetRole()));
        profile.put("yearsExperience", nz(user.getYearsExperience()));
        profile.put("industry", nz(user.getIndustry()));
        profile.put("location", nz(user.getLocation()));
        profile.put("timeframe", nz(user.getTimeframe()));
        profile.put("aspirations", nz(user.getAspirations()));
        profile.put("interests", splitList(user.getInterests()));
        profile.put("learningFormats", splitList(user.getLearningFormats()));
        profile.put("weeklyCommitment", nz(user.getWeeklyCommitment()));
        profile.put("learningStyle", nz(user.getLearningStyle()));
        profile.put("employmentStatus", nz(user.getEmploymentStatus()));
        profile.put("workMode", nz(user.getWorkMode()));
        profile.put("challenges", splitList(user.getChallenges()));
        profile.put("motivation", nz(user.getMotivation()));
        profile.put("plan", user.getPlan() == null ? "FREE" : user.getPlan().name());
        ctx.put("profile", profile);

        ctx.put("roadmap", roadmapSummary(userId));
        ctx.put("goals", goalList(userId));
        ctx.put("practice", practiceSummary(userId));
        ctx.put("resourcesCompleted", resourceProgress.findByUserId(userId).stream()
                .filter(p -> p.isCompleted()).count());
        return ctx;
    }

    /**
     * Execute a safe action on the user's behalf. Returns a human-readable
     * confirmation the AI can show, or null when the action is unknown — the
     * caller just answers without acting in that case.
     */
    @Transactional
    public String execute(Long userId, Map<String, Object> action) {
        if (action == null) return null;
        String name = String.valueOf(action.getOrDefault("action", "")).toLowerCase(Locale.ROOT);
        switch (name) {
            case "create_goal": return createGoal(userId, action);
            case "update_profile": return updateProfile(userId, action);
            case "mark_complete": return markComplete(userId, action);
            default: return null;
        }
    }

    private String createGoal(Long userId, Map<String, Object> action) {
        String title = clean(action.get("title"));
        if (title == null || title.isBlank()) {
            return "I couldn't create that goal — no title was given.";
        }
        Goal g = new Goal();
        g.setUserId(userId);
        g.setTitle(title);
        g.setDescription(clean(action.get("description")) == null ? "" : clean(action.get("description")));
        g.setPriority(clean(action.get("priority")) == null ? "medium" : clean(action.get("priority")));
        g.setTargetDate(java.time.Instant.now().plusSeconds(30L * 24 * 60 * 60));
        g.setStatus("not-started");
        g.setProgress(0);
        goals.save(g);
        return "Done — I created the goal \"" + g.getTitle() + "\" and saved it to your profile.";
    }

    private String updateProfile(Long userId, Map<String, Object> action) {
        User user = users.findById(userId).orElse(null);
        if (user == null) return "I couldn't update your profile.";
        Map<String, Object> updated = new LinkedHashMap<>();
        setField(user::setTargetRole, action.get("targetRole"), "target role", updated);
        setField(user::setCurrentRole, action.get("currentRole"), "current role", updated);
        setField(user::setTimeframe, action.get("timeframe"), "timeline", updated);
        setField(user::setIndustry, action.get("industry"), "industry", updated);
        setField(user::setLocation, action.get("location"), "location", updated);
        setField(user::setEmploymentStatus, action.get("employmentStatus"), "employment status", updated);
        setField(user::setWorkMode, action.get("workMode"), "work mode", updated);
        setField(user::setMotivation, action.get("motivation"), "motivation", updated);
        users.save(user);
        if (updated.isEmpty()) {
            return "I couldn't find a profile field to update — try something like \"set my target role to Staff Engineer\".";
        }
        return "Done — I updated your " + String.join(" and ", updated.keySet())
                + ". This now shapes your roadmap and recommendations.";
    }

    private String markComplete(Long userId, Map<String, Object> action) {
        String title = clean(action.get("title"));
        if (title == null || title.isBlank()) return null;
        String normalized = title.toLowerCase(Locale.ROOT);
        // "the system design primer" should match "System Design Primer" —
        // drop a leading article, and try containment in both directions.
        if (normalized.startsWith("the ")) normalized = normalized.substring(4);
        if (normalized.startsWith("a ")) normalized = normalized.substring(2);
        String finalNormalized = normalized;
        Resource match = resources.findAll().stream()
                .filter(r -> r.getTitle() != null)
                .filter(r -> {
                    String t = r.getTitle().toLowerCase(Locale.ROOT);
                    return t.contains(finalNormalized) || finalNormalized.contains(t);
                })
                .findFirst().orElse(null);
        if (match == null) {
            return "I couldn't find \"" + title + "\" in the library to mark complete.";
        }
        var progress = resourceProgress.findByUserIdAndResourceUrl(userId, match.getUrl())
                .orElseGet(() -> {
                    var p = new com.leapai.backend.model.ResourceProgress();
                    p.setUserId(userId);
                    p.setResourceUrl(match.getUrl());
                    return p;
                });
        progress.setCompleted(true);
        progress.setCompletedAt(java.time.Instant.now());
        resourceProgress.save(progress);
        return "Done — I marked \"" + match.getTitle() + "\" as complete. Progress saved.";
    }

    // ------------------------------------------------------------------ data

    private Map<String, Object> roadmapSummary(Long userId) {
        Roadmap roadmap = roadmaps.findFirstByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        if (roadmap == null) return null;
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("source", roadmap.getSource());
        summary.put("createdAt", roadmap.getCreatedAt() == null ? "" : roadmap.getCreatedAt().toString());
        summary.put("currentRole", nz(roadmap.getCurrentRole()));
        summary.put("targetRole", nz(roadmap.getTargetRole()));
        List<Map<String, Object>> phases = new ArrayList<>();
        try {
            Map<String, Object> content = objectMapper.readValue(roadmap.getContent(),
                    new TypeReference<Map<String, Object>>() {});
            Object phasesObj = content.get("phases");
            if (phasesObj instanceof List) {
                for (Object o : (List<?>) phasesObj) {
                    if (!(o instanceof Map)) continue;
                    @SuppressWarnings("unchecked")
                    Map<String, Object> p = (Map<String, Object>) o;
                    Map<String, Object> dto = new LinkedHashMap<>();
                    dto.put("title", String.valueOf(p.getOrDefault("title", "")));
                    dto.put("duration", String.valueOf(p.getOrDefault("duration", "")));
                    dto.put("focus", String.valueOf(p.getOrDefault("focus", "")));
                    phases.add(dto);
                }
            }
        } catch (Exception ignored) {
        }
        summary.put("phases", phases);
        return summary;
    }

    private List<Map<String, Object>> goalList(Long userId) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Goal g : goals.findByUserIdOrderByCreatedAtAsc(userId)) {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("title", g.getTitle());
            dto.put("status", g.getStatus());
            dto.put("progress", g.getProgress());
            dto.put("priority", g.getPriority());
            out.add(dto);
        }
        return out;
    }

    private Map<String, Object> practiceSummary(Long userId) {
        long total = problems.count();
        long solved = 0;
        for (var p : problems.findAll()) {
            if (submissions.existsByUserIdAndProblemIdAndVerdict(userId, p.getId(), "ACCEPTED")) solved++;
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("solved", solved);
        m.put("total", total);
        return m;
    }

    private void setField(java.util.function.Consumer<String> setter, Object value,
                          String label, Map<String, Object> updated) {
        String v = clean(value);
        if (v == null || v.isBlank()) return;
        setter.accept(v);
        updated.put(label, v);
    }

    private static String clean(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        return s.isEmpty() ? null : s;
    }

    private static String nz(String value) {
        return value == null || value.isBlank() ? "" : value;
    }

    private static List<String> splitList(String value) {
        if (value == null || value.isBlank()) return List.of();
        List<String> out = new ArrayList<>();
        for (String part : value.split(",")) {
            String t = part.trim();
            if (!t.isEmpty()) out.add(t);
        }
        return out;
    }
}
