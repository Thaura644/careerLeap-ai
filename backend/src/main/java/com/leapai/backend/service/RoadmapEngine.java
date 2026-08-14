package com.leapai.backend.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Deterministic career-roadmap generator. Replaces the old canned "mock"
 * roadmap with real logic: it analyzes the current → target role gap
 * (keyword-driven) and produces a phase plan that is genuinely specific to
 * the pair, the timeframe, and the stated focus areas.
 *
 * <p>Used when no {@code LLM_API_KEY} is configured (marked {@code source:
 * "engine"}) or as a graceful fallback if the LLM call fails. The output shape
 * is identical to the LLM path so the UI renders either seamlessly.
 */
@Service
public class RoadmapEngine {

    public Map<String, Object> generate(Map<String, Object> profile) {
        String currentRole = str(profile, "currentRole", "your current role");
        String targetRole = str(profile, "targetRole", "your target role");
        String timeframe = str(profile, "timeframe", "12 months");
        String industry = str(profile, "industry", "");
        List<String> focusAreas = stringList(profile.get("focusAreas"));

        ProfileGap gap = new ProfileGap(currentRole, targetRole);

        String summary = "From " + currentRole + " to " + targetRole
                + " within " + timeframe + ": a phased plan built around "
                + gap.primaryFocus() + ", with real-world proof at each stage.";

        List<Map<String, Object>> phases = new ArrayList<>();
        phases.add(phase("Phase 1 — Assess the gap",
                "Weeks 1–4",
                "Map what actually separates " + currentRole + " from " + targetRole
                        + " in " + (industry.isBlank() ? "your industry" : industry),
                gap.assessmentSkills(focusAreas),
                List.of(
                        "Write the top 5 requirements of " + targetRole + " from real job postings",
                        "Score yourself 1–5 against each requirement",
                        "Pick the 2 weakest requirements to attack first"),
                List.of(resource("Job description research template", "template")),
                List.of(reference("See the full " + gap.roadmapSlugLabel() + " roadmap", gap.roadmapUrl()))));

        phases.add(phase("Phase 2 — Close the technical gap",
                "Weeks 5–12",
                gap.technicalFocus(),
                gap.technicalSkills(focusAreas),
                List.of(
                        "Complete one structured deep-dive on " + gap.technicalSkills(focusAreas).get(0).toLowerCase(),
                        "Ship a project that exercises the gap skill end-to-end",
                        "Get one senior practitioner to review your work"),
                List.of(resource("Structured course", "course"), resource("Practice project spec", "template")),
                List.of(reference("Follow the " + gap.roadmapSlugLabel() + " curriculum", gap.roadmapUrl()),
                        reference("Computer Science fundamentals", "https://roadmap.sh/computer-science"))));

        phases.add(phase("Phase 3 — Prove it with real work",
                "Months 3–6",
                "Produce visible evidence that you already operate at " + targetRole,
                gap.proofSkills(),
                List.of(
                        "Lead or own one initiative end-to-end and document the outcome",
                        "Publish a case study with the numbers that moved",
                        "Present the work to at least one team outside your own"),
                List.of(resource("Case-study writing guide", "guide")),
                List.of(reference("System design depth", "https://roadmap.sh/system-design"))));

        phases.add(phase("Phase 4 — Build visibility and influence",
                "Months 5–9",
                "Make your work legible to the people who decide promotions and hires",
                gap.visibilitySkills(focusAreas),
                List.of(
                        "Write and publish one technical strategy doc or RFC",
                        "Mentor one person — evidence of operating at the next level",
                        "Grow one external signal (post, talk, or open source)"),
                List.of(resource("Technical writing checklist", "checklist"),
                        resource("Mentoring starter kit", "guide")),
                gap.visibilityReferences()));

        phases.add(phase("Phase 5 — Apply, interview, and close",
                "Months 8–12",
                "Convert the proof into the actual role",
                List.of("Storytelling with evidence", "Interview practice"),
                List.of(
                        "Do 3+ mock interviews calibrated to " + targetRole,
                        "Apply to " + targetRole + " roles with a tailored narrative",
                        "Track every application and debrief every rejection"),
                List.of(resource("Interview prep checklist", "checklist")),
                List.of(reference("Interview prep roadmap", "https://roadmap.sh/leetcode"),
                        reference("Practice on AlgoBytes (open-source coding platform)", "https://github.com/SameerKhurd/algo-bytes"))));

        Map<String, Object> roadmap = new LinkedHashMap<>();
        roadmap.put("summary", summary);
        roadmap.put("phases", phases);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("source", "engine");
        result.put("roadmap", roadmap);
        return result;
    }

    /** Keyword analysis of the role pair, driving genuinely different plans. */
    static final class ProfileGap {

        private final String current;
        private final String target;
        private final boolean toStaff;
        private final boolean toManager;
        private final boolean toLead;
        private final boolean toPrincipal;
        private final boolean toArchitect;
        private final boolean toData;
        private final boolean toProduct;
        private final boolean toDevops;
        private final boolean management;

        ProfileGap(String current, String target) {
            this.current = current.toLowerCase(Locale.ROOT);
            this.target = target.toLowerCase(Locale.ROOT);
            this.toStaff = this.target.contains("staff");
            this.toManager = this.target.contains("manager") || this.target.contains("management");
            this.toLead = this.target.contains("lead");
            this.toPrincipal = this.target.contains("principal");
            this.toArchitect = this.target.contains("architect");
            this.toData = this.target.contains("data") || this.target.contains("analytics");
            this.toProduct = this.target.contains("product");
            this.toDevops = this.target.contains("devops") || this.target.contains("sre")
                    || this.target.contains("platform");
            this.management = toManager || toLead || this.target.contains("cto")
                    || this.target.contains("director");
        }

        String primaryFocus() {
            if (toStaff || toPrincipal) return "technical depth and cross-team leverage";
            if (management) return "people leadership and organizational influence";
            if (toArchitect) return "system design and architectural decision-making";
            if (toData) return "data fundamentals and business impact";
            if (toProduct) return "product thinking and cross-functional ownership";
            if (toDevops) return "reliability engineering and platform thinking";
            return "a focused skill bridge between the two roles";
        }

        String technicalFocus() {
            if (toStaff || toPrincipal || toArchitect) {
                return "Depth: systems thinking, architecture, and operating at scale";
            }
            if (management) {
                return "Breadth: enough technical credibility to lead technical teams";
            }
            if (toData) {
                return "Statistics, SQL/data modeling, and communicating with data";
            }
            if (toProduct) {
                return "Customer research, prioritization, and delivery ownership";
            }
            if (toDevops) {
                return "Reliability, observability, and infrastructure as code";
            }
            return "Core craft in your current stack, at the next level of rigor";
        }

        List<String> assessmentSkills(List<String> focusAreas) {
            List<String> skills = new ArrayList<>();
            skills.add("Self-assessment against " + targetLevelLabel());
            if (management) {
                skills.add("1:1s and team dynamics");
            } else if (toStaff || toPrincipal) {
                skills.add("Cross-team technical influence");
            }
            if (!focusAreas.isEmpty()) {
                skills.addAll(focusAreas.subList(0, Math.min(2, focusAreas.size())));
            }
            return skills;
        }

        List<String> technicalSkills(List<String> focusAreas) {
            List<String> skills = new ArrayList<>();
            if (toStaff || toPrincipal) {
                skills.add("System design");
                skills.add("Setting technical direction");
                skills.add("Code review at scale");
            } else if (management) {
                skills.add("Technical judgment");
                skills.add("Delegation and decision-making");
            } else if (toArchitect) {
                skills.add("Architecture patterns");
                skills.add("Trade-off analysis");
            } else if (toData) {
                skills.add("SQL and data modeling");
                skills.add("Statistical thinking");
            } else if (toProduct) {
                skills.add("Prioritization frameworks");
                skills.add("Stakeholder alignment");
            } else if (toDevops) {
                skills.add("Observability");
                skills.add("Infrastructure as code");
            } else {
                skills.add(targetLevelLabel() + " craft");
            }
            if (!focusAreas.isEmpty()) {
                for (String area : focusAreas) {
                    if (!skills.contains(area)) {
                        skills.add(area);
                    }
                }
            }
            return skills;
        }

        List<String> proofSkills() {
            if (management) {
                return List.of("Leading a small initiative", "Hiring or onboarding support", "Delivery ownership");
            }
            if (toStaff || toPrincipal) {
                return List.of("Own a cross-team system", "Author an RFC that others follow", "Mentor other engineers");
            }
            if (toArchitect) {
                return List.of("Design review leadership", "System migration or consolidation");
            }
            return List.of("End-to-end ownership", "Documented outcomes with metrics");
        }

        List<String> visibilitySkills(List<String> focusAreas) {
            List<String> skills = new ArrayList<>();
            skills.add("Writing and public speaking");
            if (management) {
                skills.add("Org-level communication");
            } else if (toStaff || toPrincipal) {
                skills.add("Technical strategy documents");
            }
            if (focusAreas.stream().anyMatch(a -> a.toLowerCase(Locale.ROOT).contains("lead"))) {
                skills.add("Mentoring");
            }
            return skills;
        }

        private String targetLevelLabel() {
            if (toStaff) return "Staff Engineer";
            if (toPrincipal) return "Principal Engineer";
            if (toManager) return "Engineering Manager";
            if (toLead) return "Team Lead";
            if (toArchitect) return "Architect";
            if (toData) return "Data professional";
            if (toProduct) return "Product leader";
            return "target-level";
        }

        /** The most relevant roadmap.sh roadmap for this role gap. */
        private String roadmapSlugLabel() {
            if (toStaff || toPrincipal) return "Software Architect";
            if (toArchitect) return "Software Architect";
            if (management) return "Engineering Manager";
            if (toData) return "AI & Data Scientist";
            if (toProduct) return "Product Manager";
            if (toDevops) return "DevOps";
            return "Backend";
        }

        private String roadmapUrl() {
            if (toStaff || toPrincipal || toArchitect) return "https://roadmap.sh/software-architect";
            if (management) return "https://roadmap.sh/engineering-manager";
            if (toData) return "https://roadmap.sh/ai-data-scientist";
            if (toProduct) return "https://roadmap.sh/product-manager";
            if (toDevops) return "https://roadmap.sh/devops";
            return "https://roadmap.sh/backend";
        }

        private List<Map<String, String>> visibilityReferences() {
            if (management) {
                return List.of(reference("Engineering Manager roadmap", "https://roadmap.sh/engineering-manager"));
            }
            if (toData) {
                return List.of(reference("AI & Data Scientist roadmap", "https://roadmap.sh/ai-data-scientist"));
            }
            return List.of(reference("Software Architect roadmap", "https://roadmap.sh/software-architect"));
        }
    }

    private static Map<String, Object> phase(
            String title, String duration, String focus,
            List<String> skills, List<String> milestones, List<Map<String, String>> resources,
            List<Map<String, String>> references) {
        Map<String, Object> phase = new LinkedHashMap<>();
        phase.put("title", title);
        phase.put("duration", duration);
        phase.put("focus", focus);
        phase.put("skills", skills);
        phase.put("milestones", milestones);
        phase.put("resources", resources);
        phase.put("references", references);
        return phase;
    }

    private static Map<String, String> resource(String title, String type) {
        return Map.of("title", title, "type", type);
    }

    private static Map<String, String> reference(String label, String url) {
        return Map.of("label", label, "url", url);
    }

    private static String str(Map<String, Object> map, String key, String fallback) {
        Object value = map.get(key);
        if (value == null) return fallback;
        String s = String.valueOf(value).trim();
        return s.isEmpty() ? fallback : s;
    }

    private static List<String> stringList(Object value) {
        if (!(value instanceof List)) return List.of();
        List<String> result = new ArrayList<>();
        for (Object item : (List<?>) value) {
            if (item != null && !String.valueOf(item).isBlank()) {
                result.add(String.valueOf(item).trim());
            }
        }
        return result;
    }
}
