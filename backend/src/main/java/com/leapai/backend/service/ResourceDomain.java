package com.leapai.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Detects the career field ("domain") of both a user and a catalog resource so
 * recommendations stay relevant to the user's field — a healthcare user should
 * never be handed staff-engineering content because the engineering items have
 * more reviews.
 *
 * <p>Detection is keyword-based with word-boundary matching (so "api" never
 * fires inside "capital", and "ui" never fires inside "guide"), and it is
 * conservative: a domain is only assigned when the evidence is clear, and a
 * resource with no strong field signal is treated as GENERAL so generic career
 * content (leadership, communication, job search) stays available to everyone.
 */
public final class ResourceDomain {

    public enum Domain {
        HEALTHCARE, TECH, MARKETING, FINANCE, DESIGN, SALES, GENERAL
    }

    /**
     * Keyword lists. Single words match whole tokens (with an optional plural
     * "s"); phrases (containing a space) match as contiguous word runs. A
     * keyword is only listed when it is a strong, field-specific signal.
     */
    private static final Map<Domain, List<String>> KEYWORDS = Map.of(
            Domain.HEALTHCARE, List.of(
                    "healthcare", "health", "medical", "medicine", "clinical", "patient", "nurse",
                    "nursing", "doctor", "physician", "hospital", "anatomy", "physiology", "pediatric",
                    "pharmacy", "public health", "epidemiology", "hipaa", "ehr", "icd", "medlineplus",
                    "ncbi", "openwho", "merck manual", "nclex"),
            Domain.TECH, List.of(
                    "software", "engineer", "engineering", "developer", "programming", "coding",
                    "system design", "architecture", "architect", "microservices", "cloud", "devops",
                    "backend", "frontend", "full stack", "fullstack", "sre", "database", "api",
                    "kubernetes", "docker", "python", "java", "javascript", "cs50", "odin project",
                    "postgresql", "kaggle", "computer science", "tech teams", "technical",
                    "technology", "resilient systems", "algorithms"),
            Domain.MARKETING, List.of(
                    "marketing", "seo", "content", "social media", "campaign",
                    "inbound", "hubspot", "semrush"),
            Domain.FINANCE, List.of(
                    "finance", "financial", "accounting", "investing", "budgeting", "credit", "tax",
                    "corporate finance", "personal finance"),
            Domain.DESIGN, List.of(
                    "design", "ux", "ui", "figma", "prototyping", "usability",
                    "design system", "nielsen", "nngroup"),
            Domain.SALES, List.of(
                    "sales", "b2b", "saleshacker", "closing", "workable", "hiring", "recruiting"));

    /** Precompiled word-boundary patterns, one per keyword. */
    private static final Map<Domain, List<Pattern>> PATTERNS = compile(KEYWORDS);

    private ResourceDomain() {
    }

    private static Map<Domain, List<Pattern>> compile(Map<Domain, List<String>> keywords) {
        Map<Domain, List<Pattern>> out = new HashMap<>();
        for (Map.Entry<Domain, List<String>> e : keywords.entrySet()) {
            out.put(e.getKey(), e.getValue().stream().map(ResourceDomain::pattern).toList());
        }
        return out;
    }

    /**
     * "api" → {@code \bapi\b}; "engineer" → {@code \bengineers?\b}; a phrase
     * like "system design" → {@code \bsystem designs?\b} (plural on the last
     * word). Word boundaries stop substring false positives ("capital").
     */
    private static Pattern pattern(String keyword) {
        String escaped = Pattern.quote(keyword);
        return Pattern.compile("\\b" + escaped + "s?\\b");
    }

    /** The domain of a piece of text, or GENERAL when evidence is weak. */
    public static Domain detect(String text) {
        if (text == null || text.isBlank()) return Domain.GENERAL;
        String lower = text.toLowerCase(Locale.ROOT);
        Domain best = Domain.GENERAL;
        int bestHits = 0;
        for (Map.Entry<Domain, List<Pattern>> e : PATTERNS.entrySet()) {
            int hits = 0;
            for (Pattern p : e.getValue()) {
                if (p.matcher(lower).find()) hits++;
            }
            // A single hit on a distinctive keyword is enough; ties resolve to
            // whichever domain had more distinct keywords matched.
            if (hits > bestHits || (hits > 0 && hits == bestHits && best == Domain.GENERAL)) {
                best = e.getKey();
                bestHits = hits;
            }
        }
        return best;
    }

    /** The user's field from their profile signals, or GENERAL if unclear. */
    public static Domain userDomain(String targetRole, String currentRole, String industry,
                                    List<String> interests) {
        // Weight the signals: the target role and industry are the strongest
        // signals of where the user is headed; interests are weakest.
        int healthcare = 0, tech = 0, marketing = 0, finance = 0, design = 0, sales = 0;
        healthcare += weight(detect(targetRole), Domain.HEALTHCARE, 3);
        tech += weight(detect(targetRole), Domain.TECH, 3);
        marketing += weight(detect(targetRole), Domain.MARKETING, 3);
        finance += weight(detect(targetRole), Domain.FINANCE, 3);
        design += weight(detect(targetRole), Domain.DESIGN, 3);
        sales += weight(detect(targetRole), Domain.SALES, 3);

        healthcare += weight(detect(currentRole), Domain.HEALTHCARE, 2);
        tech += weight(detect(currentRole), Domain.TECH, 2);
        marketing += weight(detect(currentRole), Domain.MARKETING, 2);
        finance += weight(detect(currentRole), Domain.FINANCE, 2);
        design += weight(detect(currentRole), Domain.DESIGN, 2);
        sales += weight(detect(currentRole), Domain.SALES, 2);

        healthcare += weight(detect(industry), Domain.HEALTHCARE, 2);
        tech += weight(detect(industry), Domain.TECH, 2);
        marketing += weight(detect(industry), Domain.MARKETING, 2);
        finance += weight(detect(industry), Domain.FINANCE, 2);
        design += weight(detect(industry), Domain.DESIGN, 2);
        sales += weight(detect(industry), Domain.SALES, 2);

        if (interests != null) {
            for (String interest : interests) {
                healthcare += weight(detect(interest), Domain.HEALTHCARE, 1);
                tech += weight(detect(interest), Domain.TECH, 1);
                marketing += weight(detect(interest), Domain.MARKETING, 1);
                finance += weight(detect(interest), Domain.FINANCE, 1);
                design += weight(detect(interest), Domain.DESIGN, 1);
                sales += weight(detect(interest), Domain.SALES, 1);
            }
        }

        int max = Math.max(Math.max(Math.max(healthcare, tech), Math.max(marketing, finance)),
                Math.max(design, sales));
        // Require meaningful evidence (at least a strong target-role signal or
        // several weaker ones) before assigning a domain.
        if (max < 3) return Domain.GENERAL;
        if (healthcare == max) return Domain.HEALTHCARE;
        if (tech == max) return Domain.TECH;
        if (marketing == max) return Domain.MARKETING;
        if (finance == max) return Domain.FINANCE;
        if (design == max) return Domain.DESIGN;
        return Domain.SALES;
    }

    /** A human-readable label for the domain. */
    public static String label(Domain domain) {
        switch (domain) {
            case HEALTHCARE: return "Healthcare";
            case TECH: return "Technology";
            case MARKETING: return "Marketing";
            case FINANCE: return "Finance";
            case DESIGN: return "Design";
            case SALES: return "Sales";
            default: return "General";
        }
    }

    private static int weight(Domain detected, Domain expected, int weight) {
        return detected == expected ? weight : 0;
    }
}
