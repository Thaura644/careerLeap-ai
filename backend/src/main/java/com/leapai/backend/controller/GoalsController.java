package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.GoalService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Persisted career goals CRUD. */
@RestController
@RequestMapping("/api/goals")
public class GoalsController {

    private final GoalService goalService;

    public GoalsController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return goalService.list(UserContext.require());
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        String targetDate = body.get("targetDate") == null ? null : String.valueOf(body.get("targetDate"));
        return goalService.create(
                UserContext.require(),
                str(body.get("title")),
                str(body.get("description")),
                targetDate == null ? null : Instant.parse(targetDate),
                str(body.get("status")),
                intOr(body.get("progress"), 0),
                str(body.get("priority")));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable("id") Long id, @RequestBody Map<String, Object> body) {
        return goalService.update(UserContext.require(), id, body);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable("id") Long id) {
        goalService.delete(UserContext.require(), id);
        return Map.of("message", "Goal deleted");
    }

    private static String str(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static int intOr(Object value, int fallback) {
        if (value == null) return fallback;
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException e) {
            return fallback;
        }
    }
}
