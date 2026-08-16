package com.leapai.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.config.ForbiddenException;
import com.leapai.backend.model.PracticeScenario;
import com.leapai.backend.model.ScenarioProgress;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.PracticeScenarioRepository;
import com.leapai.backend.repository.ScenarioProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

/**
 * Real-world practice: case studies, build projects, interview-prep tracks,
 * and exam-prep tracks. Each scenario is a guided brief with a step-by-step
 * plan; the user works through it, marking steps done (progress persisted per
 * user).
 *
 * <p>Free users get a <em>trial</em> taste (one scenario per category is
 * flagged trial); everything else is Pro-only, enforced server-side — the
 * detail/step endpoints return 403 for locked scenarios.
 */
@Service
public class PracticeScenarioService {

    private final PracticeScenarioRepository scenarios;
    private final ScenarioProgressRepository progress;
    private final PaymentService payments;
    private final ObjectMapper objectMapper;

    public PracticeScenarioService(PracticeScenarioRepository scenarios,
                                   ScenarioProgressRepository progress,
                                   PaymentService payments,
                                   ObjectMapper objectMapper) {
        this.scenarios = scenarios;
        this.progress = progress;
        this.payments = payments;
        this.objectMapper = objectMapper;
    }

    /** All scenarios with per-user access state: open (free/trial), pro (full),
     *  or locked (visible but not accessible for this user). */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(User user) {
        boolean pro = payments.isPro(user);
        List<Map<String, Object>> out = new ArrayList<>();
        for (PracticeScenario s : scenarios.findAllByOrderByIdAsc()) {
            out.add(card(s, user, pro));
        }
        return out;
    }

    /** Full detail (brief + steps + progress). Locked for non-Pro on non-trial. */
    @Transactional(readOnly = true)
    public Map<String, Object> detail(String slug, User user) {
        PracticeScenario s = scenarios.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Scenario not found: " + slug));
        boolean pro = payments.isPro(user);
        if (!pro && !s.isTrial()) {
            throw new ForbiddenException("This scenario is a Pro feature — upgrade to unlock it.");
        }
        Map<String, Object> m = card(s, user, pro);
        m.put("description", s.getDescription());
        m.put("steps", parseSteps(s.getStepsJson()));
        m.put("completedSteps", completedSteps(s, user));
        return m;
    }

    /** Toggle one step done/undone. Returns the updated completed list. */
    @Transactional
    public Map<String, Object> toggleStep(String slug, int stepIndex, User user) {
        PracticeScenario s = scenarios.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Scenario not found: " + slug));
        boolean pro = payments.isPro(user);
        if (!pro && !s.isTrial()) {
            throw new ForbiddenException("This scenario is a Pro feature — upgrade to unlock it.");
        }
        List<Map<String, Object>> steps = parseSteps(s.getStepsJson());
        if (stepIndex < 0 || stepIndex >= steps.size()) {
            throw new IllegalArgumentException("Invalid step index: " + stepIndex);
        }
        TreeSet<Integer> completed = new TreeSet<>(completedSteps(s, user));
        if (completed.contains(stepIndex)) completed.remove(stepIndex);
        else completed.add(stepIndex);

        ScenarioProgress p = progress.findByUserIdAndScenarioSlug(user.getId(), slug)
                .orElseGet(() -> {
                    ScenarioProgress np = new ScenarioProgress();
                    np.setUserId(user.getId());
                    np.setScenarioSlug(slug);
                    return np;
                });
        p.setCompletedStepsJson(toJson(completed));
        p.setUpdatedAt(Instant.now());
        progress.save(p);
        return Map.of("completedSteps", completed.stream().toList(), "message", "Progress updated");
    }

    // ---------------------------------------------------------------- dto

    private Map<String, Object> card(PracticeScenario s, User user, boolean pro) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("slug", s.getSlug());
        m.put("title", s.getTitle());
        m.put("type", s.getType().name());
        m.put("difficulty", s.getDifficulty());
        m.put("category", s.getCategory());
        m.put("estMinutes", s.getEstMinutes());
        m.put("summary", s.getSummary());
        m.put("trial", s.isTrial());
        // Access state: pro (user is Pro), trial (free user, flagged trial), locked.
        m.put("access", pro || s.isTrial() ? "open" : "locked");
        if (pro || s.isTrial()) {
            m.put("stepCount", parseSteps(s.getStepsJson()).size());
            m.put("completedSteps", completedSteps(s, user));
        }
        return m;
    }

    private List<Integer> completedSteps(PracticeScenario s, User user) {
        return progress.findByUserIdAndScenarioSlug(user.getId(), s.getSlug())
                .map(p -> {
                    try {
                        return objectMapper.readValue(p.getCompletedStepsJson(),
                                objectMapper.getTypeFactory().constructCollectionType(List.class, Integer.class));
                    } catch (Exception e) {
                        return List.<Integer>of();
                    }
                })
                .orElse(List.of());
    }

    private List<Map<String, Object>> parseSteps(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            var node = objectMapper.readTree(json);
            if (node.isArray()) {
                return objectMapper.convertValue(node,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
            }
        } catch (Exception ignored) {
        }
        return List.of();
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "[]";
        }
    }
}
