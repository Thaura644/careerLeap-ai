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
                "userName", "Alex",
                "activityData", List.of(
                        Map.of("name", "Apr 01", "value", 20),
                        Map.of("name", "Apr 05", "value", 35),
                        Map.of("name", "Apr 10", "value", 15),
                        Map.of("name", "Apr 15", "value", 40),
                        Map.of("name", "Apr 20", "value", 30),
                        Map.of("name", "Apr 25", "value", 45),
                        Map.of("name", "Apr 30", "value", 60)
                ),
                "skillsData", List.of(
                        Map.of("name", "Technical", "value", 65),
                        Map.of("name", "Leadership", "value", 30),
                        Map.of("name", "Communication", "value", 45),
                        Map.of("name", "Domain", "value", 55)
                ),
                "overviewCards", List.of(
                        Map.of("title", "Career Roadmap Progress", "value", "68%", "percentChange", 4, "progressValue", 68),
                        Map.of("title", "Skills Completed", "value", "12/20", "percentChange", 2, "secondaryText", "2 new this month", "progressValue", 60),
                        Map.of("title", "Mentor Sessions", "value", "3", "percentChange", 0, "secondaryText", "Next: Today, 3PM", "progressValue", 30)
                ),
                "upcomingSessions", List.of(
                        Map.of("id", "1", "title", "Mentor Session: System Design Review", "time", "Today, 3:00 PM", "type", "mentor"),
                        Map.of("id", "2", "title", "Peer Group: Frontend Masters", "time", "Tomorrow, 5:00 PM", "type", "peer")
                ),
                "onlineResources", List.of(
                        Map.of("id", "1", "title", "System Design Interview Guide", "type", "article", "badge", "Recommended"),
                        Map.of("id", "2", "title", "Leadership in Tech Workshop", "type", "event", "badge", "Event")
                ),
                "achievements", List.of(
                        Map.of("id", "1", "title", "JavaScript Mastery", "date", "Earned April 1, 2025", "color", "amber"),
                        Map.of("id", "2", "title", "90-Day Streak", "date", "Earned March 15, 2025", "color", "blue")
                )
        );
    }

    public Map<String, Object> resources() {
        List<Map<String, Object>> trending = List.of(
                resource("1", "System Design for Senior Engineers", "Course", 4.9, 128, "8 hours", false, false, false),
                resource("2", "Leadership for Technical Managers", "Course", 4.7, 86, "5 hours", true, true, false),
                resource("3", "Effective Communication in Tech Teams", "Workshop", 4.8, 42, "2 hours", false, false, false),
                resource("4", "Negotiation Skills for Career Advancement", "Guide", 4.6, 56, "45 minutes", false, true, false),
                resource("5", "AI-Powered Job Search Strategies", "Webinar", 4.5, 34, "1 hour", true, false, false),
                resource("6", "Personal Branding for Professionals", "Course", 4.9, 67, "4 hours", false, false, false)
        );

        List<Map<String, Object>> recommended = List.of(
                resource("7", "Advanced System Architecture", "Course", 4.9, 213, "10 hours", true, true, false),
                resource("8", "Team Leadership Workshop", "Workshop", 4.8, 78, "3 hours", false, false, false),
                resource("9", "Microservices Design Patterns", "Guide", 4.7, 92, "6 hours", false, true, false),
                resource("10", "Tech Leadership in Startups", "Podcast", 4.6, 45, "5 episodes", false, false, false),
                resource("11", "AI Ethics for Developers", "Course", 4.9, 67, "4 hours", true, false, false),
                resource("12", "Building Resilient Systems", "eBook", 4.8, 112, "180 pages", false, true, false)
        );

        List<Map<String, Object>> completed = List.of(
                resource("13", "JavaScript for Senior Engineers", "Course", 4.9, 156, "7 hours", false, false, true),
                resource("14", "Code Review Best Practices", "Workshop", 4.8, 92, "2 hours", false, false, true)
        );

        List<Map<String, Object>> events = List.of(
                Map.of(
                        "id", "1",
                        "title", "Career Transition Strategies",
                        "description", "Learn how to transition to a new role or industry.",
                        "type", "Webinar",
                        "isPro", false,
                        "date", "April 20, 2025",
                        "time", "2:00 PM EST",
                        "color", "blue"
                ),
                Map.of(
                        "id", "2",
                        "title", "AI Tools for Career Development",
                        "description", "Hands-on workshop on leveraging AI tools.",
                        "type", "Workshop",
                        "isPro", true,
                        "date", "April 25, 2025",
                        "time", "1:00 PM EST",
                        "color", "purple"
                )
        );

        List<Map<String, Object>> bookmarked = List.of(
                trending.get(1),
                trending.get(3),
                recommended.get(0),
                recommended.get(2),
                recommended.get(5)
        );

        return Map.of(
                "trendingResources", trending,
                "recommendedResources", recommended,
                "bookmarkedResources", bookmarked,
                "completedResources", completed,
                "upcomingEvents", events
        );
    }


    public Map<String, Object> toggleBookmark(String resourceId) {
        return Map.of(
                "id", resourceId,
                "isBookmarked", true,
                "message", "Bookmark updated"
        );
    }

    public List<Map<String, Object>> community() {
        return List.of(
                Map.of("id", 101, "topic", "Interview prep", "members", 312, "lastActive", "2h ago"),
                Map.of("id", 102, "topic", "Switching to Product Management", "members", 189, "lastActive", "35m ago")
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

    public String chatResponse(String prompt) {
        String input = prompt == null ? "" : prompt.toLowerCase();
        if (input.contains("goal")) {
            return "Great direction. Set a measurable 30-day milestone and pair it with one weekly deliverable.";
        }
        if (input.contains("resource") || input.contains("recommend")) {
            return "Based on your profile, prioritize system design and leadership workshops this week.";
        }
        if (input.contains("interview")) {
            return "Focus on 3 mock interviews, one systems deep dive, and STAR-format behavioral stories.";
        }
        return "You are progressing well. Keep a weekly review cadence and focus on one high-impact skill at a time.";
    }

    private Map<String, Object> resource(
            String id,
            String title,
            String type,
            double rating,
            int reviews,
            String duration,
            boolean isPro,
            boolean isBookmarked,
            boolean isCompleted
    ) {
        return Map.of(
                "id", id,
                "title", title,
                "type", type,
                "rating", rating,
                "reviews", reviews,
                "duration", duration,
                "image", "/placeholder.svg",
                "isPro", isPro,
                "isBookmarked", isBookmarked,
                "isCompleted", isCompleted
        );
    }
}
