package com.leapai.backend.service;

import com.leapai.backend.model.Goal;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.GoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Persisted career goals — created, updated, and deleted against the database. */
@Service
public class GoalService {

    private final GoalRepository goals;

    public GoalService(GoalRepository goals) {
        this.goals = goals;
    }

    public List<Map<String, Object>> list(User user) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Goal g : goals.findByUserIdOrderByCreatedAtAsc(user.getId())) {
            result.add(dto(g));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> create(User user, String title, String description,
                                      Instant targetDate, String status, int progress, String priority) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Goal title is required");
        }
        Goal g = new Goal();
        g.setUserId(user.getId());
        g.setTitle(title.trim());
        g.setDescription(description == null ? "" : description);
        g.setTargetDate(targetDate == null ? Instant.now().plusSeconds(30L * 24 * 60 * 60) : targetDate);
        g.setStatus(status == null || status.isBlank() ? "not-started" : status);
        g.setProgress(Math.max(0, Math.min(100, progress)));
        g.setPriority(priority == null || priority.isBlank() ? "medium" : priority);
        goals.save(g);
        return dto(g);
    }

    @Transactional
    public Map<String, Object> update(User user, Long id, Map<String, Object> updates) {
        Goal g = goals.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        if (updates.containsKey("title")) g.setTitle(String.valueOf(updates.get("title")));
        if (updates.containsKey("description")) g.setDescription(String.valueOf(updates.get("description")));
        if (updates.containsKey("targetDate")) {
            g.setTargetDate(Instant.parse(String.valueOf(updates.get("targetDate"))));
        }
        if (updates.containsKey("status")) g.setStatus(String.valueOf(updates.get("status")));
        if (updates.containsKey("progress")) {
            g.setProgress(Math.max(0, Math.min(100, Integer.parseInt(String.valueOf(updates.get("progress"))))));
        }
        if (updates.containsKey("priority")) g.setPriority(String.valueOf(updates.get("priority")));
        g.setUpdatedAt(Instant.now());
        goals.save(g);
        return dto(g);
    }

    @Transactional
    public void delete(User user, Long id) {
        Goal g = goals.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        goals.delete(g);
    }

    private Map<String, Object> dto(Goal g) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", g.getId());
        dto.put("title", g.getTitle());
        dto.put("description", g.getDescription());
        dto.put("targetDate", g.getTargetDate().toString());
        dto.put("status", g.getStatus());
        dto.put("progress", g.getProgress());
        dto.put("priority", g.getPriority());
        dto.put("createdAt", g.getCreatedAt().toString());
        dto.put("updatedAt", g.getUpdatedAt().toString());
        return dto;
    }
}
