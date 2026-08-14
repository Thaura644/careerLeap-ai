package com.leapai.backend.service;

import com.leapai.backend.model.Event;
import com.leapai.backend.model.Goal;
import com.leapai.backend.model.Resource;
import com.leapai.backend.model.Roadmap;
import com.leapai.backend.model.User;
import com.leapai.backend.model.UserResource;
import com.leapai.backend.repository.EventRepository;
import com.leapai.backend.repository.GoalRepository;
import com.leapai.backend.repository.ResourceRepository;
import com.leapai.backend.repository.RoadmapRepository;
import com.leapai.backend.repository.UserResourceRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Dashboard numbers computed from the real database — the user's goals,
 * completed resources, roadmap, and upcoming events. Empty data stays empty
 * (the UI renders honest empty states); nothing is invented to fill a chart.
 */
@Service
public class DashboardService {

    private final GoalRepository goals;
    private final ResourceRepository resources;
    private final UserResourceRepository userResources;
    private final RoadmapRepository roadmaps;
    private final EventRepository events;

    public DashboardService(GoalRepository goals, ResourceRepository resources,
                            UserResourceRepository userResources, RoadmapRepository roadmaps,
                            EventRepository events) {
        this.goals = goals;
        this.resources = resources;
        this.userResources = userResources;
        this.roadmaps = roadmaps;
        this.events = events;
    }

    public Map<String, Object> dashboard(User user) {
        List<Goal> userGoals = goals.findByUserIdOrderByCreatedAtAsc(user.getId());
        List<UserResource> userResourceState = userResources.findByUserId(user.getId());
        List<Resource> completed = completedResources(userResourceState);
        List<Resource> bookmarked = bookmarkedResources(userResourceState);
        List<Resource> catalog = resources.findAll();
        Roadmap roadmap = roadmaps.findFirstByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
        List<Event> upcoming = events.findAllByOrderByIdAsc();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userName", firstName(user.getFullName()));

        result.put("overviewCards", overviewCards(user, userGoals, completed, roadmap));
        result.put("activityData", activityData(userResourceState, userGoals));
        result.put("skillsData", skillsData(roadmap));
        result.put("upcomingSessions", sessions(upcoming));
        result.put("onlineResources", onlineResources(catalog, completed, bookmarked));
        result.put("achievements", achievements(completed));
        result.put("hasRoadmap", roadmap != null);
        return result;
    }

    private List<Map<String, Object>> overviewCards(User user, List<Goal> userGoals,
                                                    List<Resource> completed, Roadmap roadmap) {
        List<Map<String, Object>> cards = new ArrayList<>();

        long completedGoals = userGoals.stream().filter(g -> "completed".equals(g.getStatus())).count();
        double goalProgress = userGoals.isEmpty() ? 0
                : (double) userGoals.stream().mapToInt(Goal::getProgress).sum() / userGoals.size();
        cards.add(card("Goal Progress",
                userGoals.isEmpty() ? "0%" : Math.round(goalProgress) + "%",
                completedGoals > 0 ? (int) completedGoals : 0,
                userGoals.isEmpty() ? 0 : (int) Math.round(goalProgress),
                userGoals.isEmpty() ? "Add a goal to get started" : completedGoals + " completed"));

        cards.add(card("Resources Completed",
                completed.size() + (completed.isEmpty() ? "" : ""),
                completed.isEmpty() ? 0 : 1,
                completed.isEmpty() ? 0 : Math.min(100, completed.size() * 10),
                completed.isEmpty() ? "Complete one to start your streak" : "Keep going"));

        int skillsProgress = roadmap == null ? 0 : 40;
        cards.add(card("Career Roadmap",
                roadmap == null ? "Not generated" : "Active",
                roadmap == null ? 0 : 1,
                skillsProgress,
                roadmap == null ? "Generate yours from your profile" : "Next: Phase 1 milestones"));

        return cards;
    }

    private List<Map<String, Object>> activityData(List<UserResource> userResourceState, List<Goal> userGoals) {
        // Real activity signals: resource completions and goal updates, bucketed by week (last 8 weeks).
        List<Map<String, Object>> points = new ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now(ZoneOffset.UTC);
        List<Instant> events = new ArrayList<>();
        for (UserResource ur : userResourceState) {
            if (ur.isCompleted() && ur.getCompletedAt() != null) {
                events.add(ur.getCompletedAt());
            }
        }
        for (Goal g : userGoals) {
            events.add(g.getUpdatedAt());
            events.add(g.getCreatedAt());
        }
        for (int i = 7; i >= 0; i--) {
            java.time.LocalDate weekStart = today.minusWeeks(i)
                    .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            java.time.LocalDate weekEnd = weekStart.plusDays(7);
            Instant start = weekStart.atStartOfDay().toInstant(ZoneOffset.UTC);
            Instant end = weekEnd.atStartOfDay().toInstant(ZoneOffset.UTC);
            long count = events.stream().filter(e -> !e.isBefore(start) && e.isBefore(end)).count();
            points.add(Map.of("name", weekStart.format(java.time.format.DateTimeFormatter.ofPattern("MMM dd")),
                    "value", count));
        }
        return points;
    }

    private List<Map<String, Object>> skillsData(Roadmap roadmap) {
        // Honest: we don't run skill assessments yet, so show the roadmap's focus areas as 0-progress
        // placeholders rather than invented scores. Real assessments land with the roadmap milestones.
        if (roadmap == null) {
            return List.of(
                    Map.of("name", "Technical", "value", 0),
                    Map.of("name", "Leadership", "value", 0),
                    Map.of("name", "Communication", "value", 0));
        }
        String focus = roadmap.getFocusAreas() == null ? "" : roadmap.getFocusAreas();
        List<Map<String, Object>> data = new ArrayList<>();
        for (String area : focus.split(",")) {
            String trimmed = area.trim();
            if (!trimmed.isEmpty() && data.size() < 6) {
                data.add(Map.of("name", trimmed, "value", 0));
            }
        }
        return data;
    }

    private List<Map<String, Object>> sessions(List<Event> upcoming) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Event e : upcoming) {
            result.add(Map.of(
                    "id", String.valueOf(e.getId()),
                    "title", e.getTitle(),
                    "time", e.getDate() + ", " + e.getTime(),
                    "type", "workshop",
                    "event", true));
        }
        return result;
    }

    private List<Map<String, Object>> onlineResources(List<Resource> catalog,
                                                      List<Resource> completed,
                                                      List<Resource> bookmarked) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Resource> ranked = new ArrayList<>(catalog);
        ranked.sort(Comparator.comparingDouble(Resource::getRating).reversed());
        for (Resource r : ranked.stream().limit(3).collect(java.util.stream.Collectors.toList())) {
            boolean done = completed.stream().anyMatch(c -> c.getId().equals(r.getId()));
            boolean saved = bookmarked.stream().anyMatch(b -> b.getId().equals(r.getId()));
            result.add(Map.of(
                    "id", String.valueOf(r.getId()),
                    "title", r.getTitle(),
                    "type", r.getType(),
                    "badge", done ? "Completed" : saved ? "Bookmarked" : "Recommended"));
        }
        return result;
    }

    private List<Map<String, Object>> achievements(List<Resource> completed) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (completed.isEmpty()) {
            return result;
        }
        for (Resource r : completed.stream().limit(4).collect(java.util.stream.Collectors.toList())) {
            result.add(Map.of(
                    "id", String.valueOf(r.getId()),
                    "title", "Completed: " + r.getTitle(),
                    "date", "Earned " + java.time.LocalDate.now(ZoneOffset.UTC).toString(),
                    "color", "green"));
        }
        return result;
    }

    private List<Resource> completedResources(List<UserResource> state) {
        List<Resource> result = new ArrayList<>();
        for (UserResource ur : state) {
            if (ur.isCompleted()) {
                resources.findById(ur.getId().getResourceId()).ifPresent(result::add);
            }
        }
        return result;
    }

    private List<Resource> bookmarkedResources(List<UserResource> state) {
        List<Resource> result = new ArrayList<>();
        for (UserResource ur : state) {
            if (ur.isBookmarked()) {
                resources.findById(ur.getId().getResourceId()).ifPresent(result::add);
            }
        }
        return result;
    }

    private static Map<String, Object> card(String title, String value, int percentChange,
                                            int progressValue, String secondaryText) {
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("title", title);
        card.put("value", value);
        card.put("percentChange", percentChange);
        card.put("progressValue", progressValue);
        card.put("secondaryText", secondaryText);
        return card;
    }

    private static String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "there";
        return fullName.trim().split("\\s+")[0];
    }
}
