package com.leapai.backend.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class MockDataService {

    public Map<String, Object> login(String email) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", UUID.randomUUID().toString());
        response.put("user", Map.of(
                "id", 1,
                "fullName", "Leap User",
                "email", email,
                "plan", "free"
        ));
        return response;
    }

    public Map<String, Object> signup(String fullName, String email) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", UUID.randomUUID().toString());
        response.put("user", Map.of(
                "id", 2,
                "fullName", fullName,
                "email", email,
                "plan", "free"
        ));
        return response;
    }

    public Map<String, Object> dashboard() {
        return Map.of(
                "profileCompletion", 68,
                "goalsCompleted", 4,
                "streakDays", 12,
                "nextMilestone", "Complete your AI skills assessment",
                "recommendedActions", List.of(
                        "Finish onboarding questionnaire",
                        "Apply to 3 relevant roles",
                        "Book one mentorship session"
                )
        );
    }

    public List<Map<String, Object>> resources() {
        return List.of(
                Map.of(
                        "id", 1,
                        "type", "course",
                        "title", "Data Analysis Fundamentals",
                        "provider", "Coursera",
                        "duration", "4 weeks"
                ),
                Map.of(
                        "id", 2,
                        "type", "event",
                        "title", "AI Career Live Workshop",
                        "provider", "Leap.ai",
                        "date", "2026-06-02"
                ),
                Map.of(
                        "id", 3,
                        "type", "article",
                        "title", "How to Build a Career Transition Plan",
                        "provider", "Leap.ai Blog",
                        "readTime", "8 min"
                )
        );
    }

    public List<Map<String, Object>> community() {
        return List.of(
                Map.of(
                        "id", 101,
                        "topic", "Interview prep",
                        "members", 312,
                        "lastActive", "2h ago"
                ),
                Map.of(
                        "id", 102,
                        "topic", "Switching to Product Management",
                        "members", 189,
                        "lastActive", "35m ago"
                )
        );
    }

    public Map<String, Object> aiInsights() {
        return Map.of(
                "topSkillGap", "Storytelling with data",
                "marketTrend", "AI product skills demand increased this quarter",
                "recommendedPath", List.of(
                        "Complete one analytics project",
                        "Publish portfolio case study",
                        "Practice weekly mock interviews"
                )
        );
    }
}
