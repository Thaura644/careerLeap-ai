package com.leapai.backend.service;

import com.leapai.backend.model.Resource;
import com.leapai.backend.repository.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * The resource engine: a maintained catalog of real, open-source learning
 * materials (YouTube courses, freeCodeCamp, official docs, open books, free
 * practice platforms) that the app can search and import into the library.
 *
 * <p>Everything here is real — every entry carries a URL that actually opens.
 * No invented titles, no placeholder links. The catalog is curated in code
 * (single source of truth) so the engine works without external API keys or
 * scraping, and new sources can be added by editing the list.
 */
@Service
public class ResourceEngine {

    private static final Logger log = LoggerFactory.getLogger(ResourceEngine.class);

    private final ResourceRepository resources;

    public ResourceEngine(ResourceRepository resources) {
        this.resources = resources;
    }

    /** One open-source catalog entry. */
    public static final class OpenItem {
        public final String title;
        public final String type;
        public final String url;
        public final String source;
        public final String difficulty;
        public final String description;
        public final List<String> topics;

        OpenItem(String title, String type, String url, String source, String difficulty,
                 String description, String... topics) {
            this.title = title;
            this.type = type;
            this.url = url;
            this.source = source;
            this.difficulty = difficulty;
            this.description = description;
            this.topics = List.of(topics);
        }
    }

    /** Curated open-source catalog. Topics drive search matching. */
    private static final List<OpenItem> OPEN_CATALOG = List.of(
            new OpenItem("System Design Primer", "Guide", "https://github.com/donnemartin/system-design-primer",
                    "GitHub", "intermediate", "The canonical open-source intro to large-scale system design.",
                    "system design", "architecture", "scalability", "distributed systems"),
            new OpenItem("freeCodeCamp — System Design Concepts Course", "Course",
                    "https://www.youtube.com/watch?v=F2FmTdLtb_4", "YouTube", "beginner",
                    "A free, complete video walkthrough of system design fundamentals.",
                    "system design", "architecture", "distributed systems"),
            new OpenItem("System Design Roadmap", "Guide", "https://roadmap.sh/system-design",
                    "roadmap.sh", "beginner", "A structured path through scalability, reliability, and trade-offs.",
                    "system design", "architecture", "roadmap"),
            new OpenItem("Designing Data-Intensive Applications", "Book", "https://dataintensive.net/",
                    "Book", "advanced", "Kleppmann's deep dive into the systems that power modern data.",
                    "distributed systems", "databases", "architecture", "consistency"),
            new OpenItem("MIT 6.824 — Distributed Systems", "Course", "https://pdos.csail.mit.edu/6.824/",
                    "Course site", "advanced", "The legendary graduate course: lectures, labs, and papers.",
                    "distributed systems", "consensus", "raft", "mapreduce"),
            new OpenItem("The Raft Consensus Algorithm", "Tool", "https://raft.github.io/",
                    "Tool", "intermediate", "Interactive visualization plus the paper that explains consensus.",
                    "distributed systems", "consensus", "raft"),
            new OpenItem("CS50x — Introduction to Computer Science", "Course", "https://cs50.harvard.edu/x/",
                    "Course site", "beginner", "Harvard's free course that builds problem-solving fundamentals.",
                    "computer science", "algorithms", "programming"),
            new OpenItem("freeCodeCamp — Data Structures & Algorithms", "Course",
                    "https://www.youtube.com/watch?v=8hly31xKli0", "YouTube", "beginner",
                    "A free video course covering arrays through graphs in JavaScript.",
                    "data structures", "algorithms", "dsa", "javascript"),
            new OpenItem("NeetCode — DSA Roadmap & Patterns", "Course", "https://neetcode.io/roadmap",
                    "NeetCode", "beginner", "Pattern-first interview prep: 15 patterns, not 2,000 problems.",
                    "algorithms", "interview prep", "data structures", "leetcode"),
            new OpenItem("LeetCode", "Practice", "https://leetcode.com/", "Practice",
                    "beginner", "The standard problem bank for coding interviews.",
                    "algorithms", "interview prep", "coding"),
            new OpenItem("Big-O Cheat Sheet", "Tool", "https://www.bigocheatsheet.com/",
                    "Tool", "beginner", "Complexity reference for every common data structure.",
                    "algorithms", "data structures", "big o"),
            new OpenItem("SQLZoo", "Practice", "https://sqlzoo.net/", "Practice",
                    "beginner", "Interactive SQL tutorials from basic joins to window functions.",
                    "sql", "databases", "data"),
            new OpenItem("Kaggle Learn", "Course", "https://www.kaggle.com/learn", "Kaggle",
                    "beginner", "Free micro-courses on Python, SQL, ML, and visualization.",
                    "data science", "machine learning", "python", "sql"),
            new OpenItem("An Introduction to Statistical Learning", "Book", "https://www.statlearning.com/",
                    "Book", "intermediate", "The free, accessible companion to the ML classics.",
                    "statistics", "machine learning", "data science"),
            new OpenItem("The Odin Project", "Course", "https://www.theodinproject.com/",
                    "Course site", "beginner", "Free, project-driven full-stack curriculum.",
                    "frontend", "web development", "javascript", "react"),
            new OpenItem("freeCodeCamp — JavaScript Full Course", "Course",
                    "https://www.youtube.com/watch?v=PkZNo7MFNFg", "YouTube", "beginner",
                    "An 8-hour free JavaScript course from beginner to advanced.",
                    "javascript", "frontend", "web development"),
            new OpenItem("MDN — JavaScript", "Docs", "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                    "MDN", "beginner", "The authoritative JavaScript reference, updated with every spec.",
                    "javascript", "frontend", "web development"),
            new OpenItem("React Official Docs", "Docs", "https://react.dev/", "Docs",
                    "beginner", "The modern React docs — hooks, rendering, thinking in components.",
                    "react", "frontend", "typescript"),
            new OpenItem("TypeScript Handbook", "Docs", "https://www.typescriptlang.org/docs/handbook/intro.html",
                    "Docs", "beginner", "The official language guide, from basics to advanced types.",
                    "typescript", "frontend", "javascript"),
            new OpenItem("Backend Roadmap", "Guide", "https://roadmap.sh/backend", "roadmap.sh",
                    "beginner", "The complete backend curriculum — languages, APIs, databases, scaling.",
                    "backend", "api", "databases", "roadmap"),
            new OpenItem("PostgreSQL Documentation", "Docs", "https://www.postgresql.org/docs/",
                    "Docs", "intermediate", "The official docs — indexing, transactions, query planning.",
                    "sql", "databases", "backend"),
            new OpenItem("The Twelve-Factor App", "Guide", "https://12factor.net/",
                    "Guide", "intermediate", "The classic checklist for building deployable services.",
                    "backend", "devops", "architecture"),
            new OpenItem("DevOps Roadmap", "Guide", "https://roadmap.sh/devops", "roadmap.sh",
                    "beginner", "The end-to-end DevOps curriculum: containers, CI/CD, cloud, IaC.",
                    "devops", "cloud", "kubernetes", "docker"),
            new OpenItem("Kubernetes Documentation", "Docs", "https://kubernetes.io/docs/",
                    "Docs", "intermediate", "The official Kubernetes docs plus interactive tutorials.",
                    "kubernetes", "devops", "cloud", "containers"),
            new OpenItem("Google SRE Book", "Book", "https://sre.google/sre-book/table-of-contents/",
                    "Book", "intermediate", "Free — the blueprint for running reliable production systems.",
                    "sre", "reliability", "devops", "observability"),
            new OpenItem("Play with Docker", "Practice", "https://labs.play-with-docker.com/",
                    "Practice", "beginner", "Run Docker in your browser — no install needed.",
                    "docker", "devops", "containers"),
            new OpenItem("Google Technical Writing Courses", "Course",
                    "https://developers.google.com/tech-writing", "Google", "beginner",
                    "Free, practical — two courses on clarity, structure, and audience.",
                    "technical writing", "documentation", "communication"),
            new OpenItem("Write the Docs", "Guide", "https://www.writethedocs.org/guide/",
                    "Guide", "beginner", "The community standard for writing clear technical docs.",
                    "technical writing", "documentation"),
            new OpenItem("StaffEng — Staff Engineer's Path", "Guide", "https://staffeng.com/guides/staff-engineers-path",
                    "StaffEng", "intermediate", "The canonical guide to operating at Staff level.",
                    "leadership", "staff", "career", "influence"),
            new OpenItem("Radical Candor", "Book", "https://www.radicalcandor.com/",
                    "Book", "beginner", "The feedback framework for mentoring and managing.",
                    "leadership", "mentoring", "communication", "management"),
            new OpenItem("Interview Prep Roadmap", "Guide", "https://roadmap.sh/leetcode", "roadmap.sh",
                    "beginner", "A realistic plan for interview prep — scope, cadence, and practice.",
                    "interview prep", "algorithms", "career"),
            new OpenItem("Levels.fyi", "Tool", "https://www.levels.fyi/", "Tool",
                    "beginner", "Real compensation data to ground your negotiation.",
                    "career", "negotiation", "compensation"),
            new OpenItem("Storytelling with Data", "Book", "https://www.storytellingwithdata.com/",
                    "Book", "intermediate", "The book that makes charts actually communicate.",
                    "data", "analytics", "communication", "visualization"),
            new OpenItem("Rust Book", "Book", "https://doc.rust-lang.org/book/", "Book",
                    "beginner", "The official free Rust programming language book.",
                    "rust", "programming", "backend")
    );

    /** Search the open-source catalog by title/topics. Never calls out to the
     *  network — the catalog is curated in code, so results are instant and
     *  every link is known-good. */
    public List<Map<String, Object>> search(String query, int limit) {
        String q = normalize(query);
        List<Map<String, Object>> out = new ArrayList<>();
        for (OpenItem item : OPEN_CATALOG) {
            if (q.isEmpty()) {
                out.add(dto(item));
                continue;
            }
            String hay = normalize(item.title + " " + String.join(" ", item.topics));
            if (hay.contains(q)) out.add(dto(item));
            if (out.size() >= limit) break;
        }
        return out;
    }

    /** Import an open-source item into the library (idempotent by URL). */
    public Resource importItem(String title, String type, String url, String source,
                               String description) {
        return resources.findByUrl(url).orElseGet(() -> {
            Resource r = new Resource();
            r.setTitle(title);
            r.setType(type == null || type.isBlank() ? "Guide" : type);
            r.setUrl(url);
            r.setSource("open");
            r.setCategory("OTHER");
            r.setDescription(description);
            r.setRating(0);
            r.setReviews(0);
            r.setDuration("Open source");
            r.setPro(false);
            resources.save(r);
            log.info("[engine] imported open resource: {} ({})", title, source);
            return r;
        });
    }

    /** Import an arbitrary URL by detecting its platform from the host. */
    public Resource importByUrl(String url, String title) {
        String platform = platform(url);
        String fallbackTitle = title == null || title.isBlank() ? "Open resource — " + platform : title;
        return importItem(fallbackTitle, "Guide", url, platform, "Imported from " + platform);
    }

    /** Human-readable platform label for a URL, derived from the host. */
    public static String platform(String url) {
        if (url == null || url.isBlank()) return "Web";
        String host = url.toLowerCase(Locale.ROOT);
        if (host.contains("youtube.com") || host.contains("youtu.be")) return "YouTube";
        if (host.contains("github.com")) return "GitHub";
        if (host.contains("medium.com")) return "Medium";
        if (host.contains("roadmap.sh")) return "roadmap.sh";
        if (host.contains("freecodecamp")) return "freeCodeCamp";
        if (host.contains("kaggle.com")) return "Kaggle";
        if (host.contains("mdn.") || host.contains("developer.mozilla")) return "MDN";
        if (host.contains("postgresql.org")) return "PostgreSQL";
        if (host.contains("leetcode.com")) return "LeetCode";
        if (host.contains("coursera.org")) return "Coursera";
        if (host.contains("udemy.com")) return "Udemy";
        if (host.contains("dev.to")) return "DEV Community";
        if (host.contains("wikipedia.org")) return "Wikipedia";
        if (host.contains(".pdf")) return "PDF";
        return "Web";
    }

    private Map<String, Object> dto(OpenItem item) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("title", item.title);
        m.put("type", item.type);
        m.put("url", item.url);
        m.put("source", item.source);
        m.put("difficulty", item.difficulty);
        m.put("description", item.description);
        m.put("topics", item.topics);
        return m;
    }

    private static String normalize(String value) {
        if (value == null) return "";
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
