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
 * <p>Works for <b>any</b> career pair — senior engineer → staff, but also
 * marketing → healthcare, sales → data, support → product. The engine
 * detects the target domain (tech, healthcare, marketing, finance, design,
 * etc.) and shapes the phases, skills, proof, and references to match, so a
 * career transition never gets a developer-only plan.
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
                List.of()));

        phases.add(phase("Phase 2 — Close the skill gap",
                "Weeks 5–12",
                gap.skillFocus(),
                gap.skillGapSkills(focusAreas),
                List.of(
                        "Complete one structured deep-dive on " + gap.firstSkill(focusAreas),
                        "Ship a project or deliverable that exercises the gap skill end-to-end",
                        "Get one senior practitioner to review your work"),
                List.of(resource("Structured course", "course"), resource("Practice project spec", "template")),
                gap.curriculumReferences()));

        phases.add(phase("Phase 3 — Prove it with real work",
                "Months 3–6",
                "Produce visible evidence that you already operate at " + targetRole,
                gap.proofSkills(),
                List.of(
                        "Lead or own one initiative end-to-end and document the outcome",
                        "Publish a case study with the numbers that moved",
                        "Present the work to at least one team outside your own"),
                List.of(resource("Case-study writing guide", "guide")),
                gap.depthReferences()));

        phases.add(phase("Phase 4 — Build visibility and influence",
                "Months 5–9",
                "Make your work legible to the people who decide promotions and hires",
                gap.visibilitySkills(focusAreas),
                List.of(
                        "Publish one strategy doc, post, or thought-leadership piece",
                        "Mentor or coach one person — evidence of operating at the next level",
                        "Grow one external signal (post, talk, or portfolio)"),
                List.of(resource("Writing checklist", "checklist"),
                        resource("Mentoring starter kit", "guide")),
                List.of()));

        phases.add(phase("Phase 5 — Apply, interview, and close",
                "Months 8–12",
                "Convert the proof into the actual role",
                List.of("Storytelling with evidence", "Interview practice"),
                List.of(
                        "Do 3+ mock interviews calibrated to " + targetRole,
                        "Apply to " + targetRole + " roles with a tailored narrative",
                        "Track every application and debrief every rejection"),
                List.of(resource("Interview prep checklist", "checklist")),
                gap.interviewReferences()));

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

        enum Domain {
            TECH, HEALTHCARE, MARKETING, SALES, FINANCE, DESIGN, HR, LEGAL, EDUCATION,
            OPERATIONS, DATA, PRODUCT, OTHER
        }

        private final String current;
        private final String target;
        private final Domain domain;
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
            this.domain = detectDomain(this.target.isEmpty() ? this.current : this.target);
        }

        /** The target's broad field, so non-tech transitions get non-tech plans. */
        private static Domain detectDomain(String role) {
            String t = role.toLowerCase(Locale.ROOT);
            if (containsAny(t, "health", "medical", "clinical", "nurse", "physician", "doctor",
                    "pharmac", "therapy", "physio", "hospital", "dentist", "veterinary")) {
                return Domain.HEALTHCARE;
            }
            if (containsAny(t, "market", "growth", "seo", "brand", "content", "advertis",
                    "social media", "public relation", "pr specialist", "campaign")) {
                return Domain.MARKETING;
            }
            if (containsAny(t, "sales", "account executive", "business development",
                    "salesforce", "customer success", "account manager", "commercial")) {
                return Domain.SALES;
            }
            if (containsAny(t, "finance", "accounting", "accountant", "audit", "bank",
                    "treasury", "actuar", "invest", "wealth", "controller", "tax ")) {
                return Domain.FINANCE;
            }
            if (containsAny(t, "designer", "design", "ux", "ui ", "visual", "graphic",
                    "creative", "art direction")) {
                return Domain.DESIGN;
            }
            if (containsAny(t, "human resource", "hr ", "recruit", "talent ", "people ops",
                    "people operations", "people partner")) {
                return Domain.HR;
            }
            if (containsAny(t, "legal", "lawyer", "attorney", "compliance", "paralegal",
                    "contract", "counsel", "regulatory")) {
                return Domain.LEGAL;
            }
            if (containsAny(t, "teacher", "educat", "lectur", "trainer", "curriculum",
                    "instructional", "professor", "instructor")) {
                return Domain.EDUCATION;
            }
            if (containsAny(t, "logistics", "supply chain", "operations", "project manager",
                    "project management", "program manager", "procurement")) {
                return Domain.OPERATIONS;
            }
            if (containsAny(t, "data", "analytics", "analyst", "scientist", "business intelligence",
                    "machine learning")) {
                return Domain.DATA;
            }
            if (t.contains("product")) {
                return Domain.PRODUCT;
            }
            return Domain.TECH;
        }

        private static boolean containsAny(String text, String... needles) {
            for (String needle : needles) {
                if (text.contains(needle)) return true;
            }
            return false;
        }

        private boolean isTech() {
            return domain == Domain.TECH;
        }

        private boolean isPeopleDomain() {
            return domain == Domain.MARKETING || domain == Domain.SALES || domain == Domain.HR
                    || domain == Domain.EDUCATION || domain == Domain.OPERATIONS || domain == Domain.PRODUCT;
        }

        String primaryFocus() {
            if (toStaff || toPrincipal) return "technical depth and cross-team leverage";
            if (management) return "people leadership and organizational influence";
            if (toArchitect) return "system design and architectural decision-making";
            switch (domain) {
                case HEALTHCARE: return "clinical credibility and patient-facing proof";
                case MARKETING: return "channel expertise and measurable campaign impact";
                case SALES: return "revenue ownership and pipeline execution";
                case FINANCE: return "financial rigor and decision-grade reporting";
                case DESIGN: return "craft depth and a portfolio that shows the thinking";
                case HR: return "people practices and organizational credibility";
                case LEGAL: return "legal depth and risk judgment";
                case EDUCATION: return "teaching craft and learner outcomes";
                case OPERATIONS: return "process ownership and operational leverage";
                case DATA: return "data fundamentals and business impact";
                case PRODUCT: return "product thinking and cross-functional ownership";
                default: return "a focused skill bridge between the two roles";
            }
        }

        String skillFocus() {
            if (toStaff || toPrincipal || toArchitect) {
                return "Depth: systems thinking, architecture, and operating at scale";
            }
            if (management) {
                return "Breadth: enough credibility to lead technical teams";
            }
            switch (domain) {
                case HEALTHCARE: return "Clinical knowledge, patient communication, and the credentials the role requires";
                case MARKETING: return "Channel craft (SEO, paid, content, lifecycle), analytics, and campaign execution";
                case SALES: return "Pipeline management, discovery, negotiation, and quota discipline";
                case FINANCE: return "Accounting or modeling fundamentals, reporting, and regulatory awareness";
                case DESIGN: return "Design craft, tools, user research, and case-study quality";
                case HR: return "Employment law basics, hiring practices, and people operations";
                case LEGAL: return "Legal fundamentals, document craft, and risk assessment";
                case EDUCATION: return "Instructional design, delivery craft, and assessment";
                case OPERATIONS: return "Process design, tools, and cross-functional coordination";
                case DATA: return "Statistics, SQL/data modeling, and communicating with data";
                case PRODUCT: return "Customer research, prioritization, and delivery ownership";
                default: return "Core craft in your current field, at the next level of rigor";
            }
        }

        List<String> assessmentSkills(List<String> focusAreas) {
            List<String> skills = new ArrayList<>();
            skills.add("Self-assessment against " + targetLevelLabel());
            if (management) {
                skills.add("1:1s and team dynamics");
            } else if (toStaff || toPrincipal) {
                skills.add("Cross-team technical influence");
            } else if (domain == Domain.HEALTHCARE) {
                skills.add("Clinical scope and ethical practice");
            } else if (domain == Domain.MARKETING || domain == Domain.SALES) {
                skills.add("Measuring the impact of your work");
            } else if (domain == Domain.DESIGN) {
                skills.add("Portfolio case-study depth");
            }
            if (!focusAreas.isEmpty()) {
                skills.addAll(focusAreas.subList(0, Math.min(2, focusAreas.size())));
            }
            return skills;
        }

        List<String> skillGapSkills(List<String> focusAreas) {
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
            } else if (domain == Domain.DATA) {
                skills.add("SQL and data modeling");
                skills.add("Statistical thinking");
            } else if (domain == Domain.PRODUCT) {
                skills.add("Prioritization frameworks");
                skills.add("Stakeholder alignment");
            } else if (toDevops) {
                skills.add("Observability");
                skills.add("Infrastructure as code");
            } else {
                switch (domain) {
                    case HEALTHCARE:
                        skills.add("Clinical assessment and documentation");
                        skills.add("Patient or client communication");
                        break;
                    case MARKETING:
                        skills.add("Campaign planning and execution");
                        skills.add("Marketing analytics and reporting");
                        break;
                    case SALES:
                        skills.add("Discovery and qualification");
                        skills.add("Negotiation and closing");
                        break;
                    case FINANCE:
                        skills.add("Financial modeling and analysis");
                        skills.add("Reporting accuracy");
                        break;
                    case DESIGN:
                        skills.add("Visual craft and prototyping");
                        skills.add("User research and testing");
                        break;
                    case HR:
                        skills.add("Recruiting and hiring practices");
                        skills.add("Employee relations basics");
                        break;
                    case LEGAL:
                        skills.add("Legal research and writing");
                        skills.add("Risk and compliance judgment");
                        break;
                    case EDUCATION:
                        skills.add("Lesson and curriculum design");
                        skills.add("Assessment and feedback");
                        break;
                    case OPERATIONS:
                        skills.add("Process design and documentation");
                        skills.add("Vendor and stakeholder coordination");
                        break;
                    default:
                        skills.add(targetLevelLabel() + " craft");
                        break;
                }
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

        /** The first skill to deep-dive, used in the Phase 2 milestone. */
        String firstSkill(List<String> focusAreas) {
            if (!focusAreas.isEmpty()) return focusAreas.get(0).toLowerCase(Locale.ROOT);
            List<String> skills = skillGapSkills(List.of());
            return skills.isEmpty() ? "the gap skill" : skills.get(0).toLowerCase(Locale.ROOT);
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
            switch (domain) {
                case HEALTHCARE:
                    return List.of("A supervised clinical or client rotation", "Documented patient or client outcomes");
                case MARKETING:
                    return List.of("One campaign you planned and measured", "A growth experiment with a written result");
                case SALES:
                    return List.of("A pipeline you built and closed", "A recorded discovery or pitch you can share");
                case FINANCE:
                    return List.of("A model or report you owned end-to-end", "A reconciliation or audit you completed");
                case DESIGN:
                    return List.of("Two portfolio case studies with real constraints", "A usability test you ran and acted on");
                case HR:
                    return List.of("A hiring loop or onboarding you owned", "A people process you documented");
                case LEGAL:
                    return List.of("A contract or matter you drafted and finalized", "A compliance review you led");
                case EDUCATION:
                    return List.of("A course or module you designed and taught", "Measured learner outcomes");
                case OPERATIONS:
                    return List.of("A process you redesigned with measured results", "A cross-team rollout you ran");
                case DATA:
                    return List.of("An analysis that changed a decision", "A dashboard or model others use");
                case PRODUCT:
                    return List.of("A shipped feature with measurable adoption", "A prioritization decision you owned");
                default:
                    return List.of("End-to-end ownership", "Documented outcomes with metrics");
            }
        }

        List<String> visibilitySkills(List<String> focusAreas) {
            List<String> skills = new ArrayList<>();
            skills.add("Writing and public speaking");
            if (management) {
                skills.add("Org-level communication");
            } else if (toStaff || toPrincipal) {
                skills.add("Technical strategy documents");
            } else if (domain == Domain.DESIGN || domain == Domain.MARKETING) {
                skills.add("A public portfolio or body of work");
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
            return domain == Domain.TECH ? "target-level" : "the target role";
        }

        /** Real, known-good curriculum links for the domain (tech/data only —
         *  we never invent URLs for other fields, so non-tech transitions get
         *  an honest empty list and rely on the roadmap's own milestones). */
        private List<Map<String, String>> curriculumReferences() {
            if (toStaff || toPrincipal || toArchitect || domain == Domain.TECH) {
                String label = toStaff || toPrincipal || toArchitect ? "Software Architect" : "Backend";
                return List.of(reference(label + " roadmap", "https://roadmap.sh/"
                        + (toStaff || toPrincipal || toArchitect ? "software-architect" : "backend")));
            }
            if (management) {
                return List.of(reference("Engineering Manager roadmap", "https://roadmap.sh/engineering-manager"));
            }
            if (domain == Domain.DATA) {
                return List.of(reference("Kaggle Learn — free data micro-courses", "https://www.kaggle.com/learn"));
            }
            return List.of();
        }

        private List<Map<String, String>> depthReferences() {
            if (toStaff || toPrincipal || toArchitect) {
                return List.of(reference("System design depth", "https://roadmap.sh/system-design"));
            }
            if (domain == Domain.DATA) {
                return List.of(reference("Kaggle Learn — free data micro-courses", "https://www.kaggle.com/learn"));
            }
            return List.of();
        }

        private List<Map<String, String>> interviewReferences() {
            if (toStaff || toPrincipal || domain == Domain.TECH) {
                return List.of(reference("Interview prep roadmap", "https://roadmap.sh/leetcode"),
                        reference("Practice on AlgoBytes (open-source coding platform)",
                                "https://github.com/SameerKhurd/algo-bytes"));
            }
            return List.of();
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
