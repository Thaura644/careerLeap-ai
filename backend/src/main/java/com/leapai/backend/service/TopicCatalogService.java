package com.leapai.backend.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * The topic resource catalog — the server-maintained map from skills/topics to
 * learning resources and tools (roadmap.sh style). Roadmap segments match
 * against entries here by keyword, and the same catalog is served to every
 * client via the API, so all platforms share one source of truth.
 *
 * <p>The catalog is curated in code (single source of truth, like
 * {@link ResourceEngine}): entries are stable, known-good links (official docs,
 * free courses, widely-used tools). Editing this list updates the catalog for
 * every client.
 */
@Service
public class TopicCatalogService {

    /** One catalog link: a resource or a tool. */
    public static final class CatalogLink {
        final String title;
        final String url;
        final String kind;
        final String note;

        CatalogLink(String title, String url, String kind, String note) {
            this.title = title;
            this.url = url;
            this.kind = kind;
            this.note = note;
        }
    }

    /** One topic entry: keywords used for matching, plus resources and tools. */
    public static final class TopicEntry {
        final String topic;
        final List<String> keywords;
        final List<CatalogLink> resources;
        final List<CatalogLink> tools;

        TopicEntry(String topic, List<String> keywords,
                   List<CatalogLink> resources, List<CatalogLink> tools) {
            this.topic = topic;
            this.keywords = keywords;
            this.resources = resources;
            this.tools = tools;
        }
    }

    private static CatalogLink link(String title, String url, String kind) {
        return new CatalogLink(title, url, kind, null);
    }

    private static CatalogLink link(String title, String url, String kind, String note) {
        return new CatalogLink(title, url, kind, note);
    }

    /** The maintained catalog. Topics drive keyword matching against roadmap segments. */
    public static final List<TopicEntry> CATALOG = List.of(
            new TopicEntry("System design",
                    List.of("system design", "systems design", "architecture", "architect", "scalab",
                            "distributed", "trade-off", "tradeoff", "microservice", "load balancing",
                            "caching", "database design", "high-level design", "hld"),
                    List.of(
                            link("System Design Primer (GitHub)", "https://github.com/donnemartin/system-design-primer", "Guide",
                                    "The canonical open-source intro: from DNS to CDNs, queues, and consistent hashing."),
                            link("System Design Roadmap", "https://roadmap.sh/system-design", "Course",
                                    "A structured path through scalability, reliability, and design trade-offs."),
                            link("System Design Interview — An Insider's Guide", "https://bytebytego.com/", "Book",
                                    "Alex Xu's step-by-step interview framework with real case studies."),
                            link("AWS Architecture Center", "https://aws.amazon.com/architecture/", "Guide",
                                    "Reference architectures and whitepapers from the biggest cloud provider."),
                            link("Designing Data-Intensive Applications", "https://dataintensive.net/", "Book",
                                    "Martin Kleppmann's deep dive into the systems that power modern data.")),
                    List.of(
                            link("Excalidraw", "https://excalidraw.com/", "Tool",
                                    "Free, fast diagramming — the default whiteboard for design interviews."),
                            link("draw.io", "https://app.diagrams.net/", "Tool",
                                    "Full-featured architecture diagram editor with cloud shapes."),
                            link("System Design Interview on Pramp", "https://www.pramp.com/", "Practice",
                                    "Free mock design interviews with real engineers."))),

            new TopicEntry("Distributed systems",
                    List.of("distributed systems", "consistency", "consensus", "raft", "kafka",
                            "message queue", "replication", "partitioning", "sharding",
                            "event-driven", "event driven"),
                    List.of(
                            link("MIT 6.824: Distributed Systems", "https://pdos.csail.mit.edu/6.824/", "Course",
                                    "The legendary graduate course — lectures, labs, and papers on Raft, MapReduce, and more."),
                            link("Designing Data-Intensive Applications", "https://dataintensive.net/", "Book",
                                    "Consistency, replication, partitioning, and the trade-offs behind them."),
                            link("The Raft Consensus Algorithm", "https://raft.github.io/", "Guide",
                                    "Interactive visualization plus the paper that explains consensus simply."),
                            link("Grokking the Distributed Systems Interview", "https://www.educative.io/courses/grokking-the-distributed-systems-interview", "Course",
                                    "Pattern-based walkthrough of common distributed systems questions.")),
                    List.of(
                            link("Apache Kafka", "https://kafka.apache.org/", "Tool",
                                    "The industry-standard event streaming platform — learn by running it."),
                            link("etcd", "https://etcd.io/", "Tool",
                                    "Distributed key-value store used by Kubernetes — great for Raft hands-on."),
                            link("LocalStack", "https://www.localstack.cloud/", "Tool",
                                    "Run AWS services locally to practice building distributed systems."))),

            new TopicEntry("Data structures & algorithms",
                    List.of("data structure", "algorithm", "leetcode", "coding interview", "dsa",
                            "problem solving", "algorithms", "interview practice", "interview prep"),
                    List.of(
                            link("Data Structures & Algorithms Roadmap", "https://roadmap.sh/datastructures-and-algorithms", "Course",
                                    "The full curriculum, from big-O to advanced graphs."),
                            link("CS50x — Introduction to Computer Science", "https://cs50.harvard.edu/x/", "Course",
                                    "Harvard's free course that builds problem-solving fundamentals."),
                            link("NeetCode — DSA Roadmap & Patterns", "https://neetcode.io/roadmap", "Course",
                                    "Pattern-first approach: grind the 15 patterns, not 2,000 problems."),
                            link("Grokking the Coding Interview", "https://www.educative.io/courses/grokking-the-coding-interview", "Course",
                                    "The sliding window / two pointers / BFS pattern catalog."),
                            link("Introduction to Algorithms (CLRS)", "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", "Book",
                                    "The definitive reference — use it for depth, not first pass.")),
                    List.of(
                            link("LeetCode", "https://leetcode.com/", "Practice",
                                    "The standard problem bank for coding interviews."),
                            link("NeetCode", "https://neetcode.io/", "Practice",
                                    "Curated problem lists + video solutions organized by pattern."),
                            link("HackerRank", "https://www.hackerrank.com/", "Practice",
                                    "Skill-based challenges plus a full interview prep kit."),
                            link("Big-O Cheat Sheet", "https://www.bigocheatsheet.com/", "Tool",
                                    "Complexity reference for every common data structure."))),

            new TopicEntry("Backend engineering",
                    List.of("backend", "server-side", "server side", "api design", "rest", "graphql",
                            "database", "sql", "postgres", "microservices", "microservice", "node.js",
                            "nodejs", "spring", "java", "python", "go", "golang"),
                    List.of(
                            link("Backend Roadmap", "https://roadmap.sh/backend", "Course",
                                    "The complete backend curriculum — languages, APIs, databases, scaling."),
                            link("MDN — HTTP & APIs", "https://developer.mozilla.org/en-US/docs/Web/HTTP", "Guide",
                                    "Authoritative reference for HTTP semantics, status codes, and caching."),
                            link("PostgreSQL Documentation", "https://www.postgresql.org/docs/", "Guide",
                                    "The official docs — indexing, transactions, and query planning."),
                            link("REST API Tutorial", "https://restfulapi.net/", "Guide",
                                    "Resource modeling, status codes, versioning, and idempotency."),
                            link("The Twelve-Factor App", "https://12factor.net/", "Guide",
                                    "The classic checklist for building deployable, scalable services.")),
                    List.of(
                            link("Postman", "https://www.postman.com/", "Tool",
                                    "Design, test, and document APIs with collections."),
                            link("Insomnia", "https://insomnia.rest/", "Tool",
                                    "Open-source API client, great for GraphQL too."),
                            link("Docker", "https://www.docker.com/", "Tool",
                                    "Containerize services and run full stacks locally."),
                            link("PlanetScale / Supabase", "https://supabase.com/", "Tool",
                                    "Managed Postgres with a free tier — practice on real infrastructure."))),

            new TopicEntry("Frontend engineering",
                    List.of("frontend", "front-end", "front end", "react", "typescript", "javascript",
                            "css", "web development", "ui", "accessibility", "a11y"),
                    List.of(
                            link("Frontend Roadmap", "https://roadmap.sh/frontend", "Course",
                                    "Everything from HTML/CSS to frameworks and testing."),
                            link("React Official Docs", "https://react.dev/", "Guide",
                                    "The modern React docs — hooks, rendering, and thinking in components."),
                            link("MDN — JavaScript", "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "Guide",
                                    "The authoritative JavaScript reference, updated with every spec."),
                            link("TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html", "Guide",
                                    "The official language guide, from basics to advanced types."),
                            link("The Odin Project", "https://www.theodinproject.com/", "Course",
                                    "Free, project-driven full-stack curriculum that starts with foundations.")),
                    List.of(
                            link("WebAIM Contrast Checker", "https://webaim.org/resources/contrastchecker/", "Tool",
                                    "Verify WCAG contrast ratios for accessible UI."),
                            link("Lighthouse (Chrome DevTools)", "https://developer.chrome.com/docs/lighthouse/overview", "Tool",
                                    "Built-in performance, accessibility, and SEO audits."),
                            link("Storybook", "https://storybook.js.org/", "Tool",
                                    "Build and document UI components in isolation."))),

            new TopicEntry("DevOps & cloud",
                    List.of("devops", "cloud", "aws", "azure", "gcp", "kubernetes", "k8s", "docker",
                            "ci/cd", "cicd", "terraform", "infrastructure", "sre", "reliability",
                            "observability", "monitoring", "platform"),
                    List.of(
                            link("DevOps Roadmap", "https://roadmap.sh/devops", "Course",
                                    "The end-to-end DevOps curriculum: containers, CI/CD, cloud, IaC."),
                            link("Kubernetes Documentation", "https://kubernetes.io/docs/", "Guide",
                                    "The official docs plus interactive tutorials."),
                            link("AWS Skill Builder", "https://explore.skillbuilder.aws/", "Course",
                                    "Free official AWS courses and labs (many free-tier)."),
                            link("Google SRE Book", "https://sre.google/sre-book/table-of-contents/", "Book",
                                    "Free — the blueprint for running reliable production systems."),
                            link("Terraform Learn", "https://developer.hashicorp.com/terraform/tutorials", "Course",
                                    "Infrastructure-as-code tutorials from HashiCorp.")),
                    List.of(
                            link("Killercoda", "https://killercoda.com/", "Practice",
                                    "Free, browser-based Kubernetes and DevOps sandboxes."),
                            link("Play with Docker", "https://labs.play-with-docker.com/", "Practice",
                                    "Run Docker in your browser — no install needed."),
                            link("Grafana Play", "https://play.grafana.org/", "Practice",
                                    "Explore real dashboards to learn observability."))),

            new TopicEntry("Leadership & influence",
                    List.of("leadership", "mentor", "mentoring", "influence", "cross-team", "cross team",
                            "stakeholder", "delegation", "management", "staff", "principal", "visibility",
                            "coaching"),
                    List.of(
                            link("StaffEng — Staff Engineer's Path", "https://staffeng.com/guides/staff-engineers-path", "Guide",
                                    "The canonical guide to operating at Staff level."),
                            link("StaffEng — Leadership Without Management", "https://staffeng.com/guides/leadership-without-management", "Article",
                                    "How senior ICs lead through influence, not authority."),
                            link("The Manager's Path", "https://www.oreilly.com/library/view/the-managers-path/9781491973882/", "Book",
                                    "Camille Fournier's roadmap for leadership at every level."),
                            link("Radical Candor", "https://www.radicalcandor.com/", "Book",
                                    "The feedback framework for mentoring and managing."),
                            link("Scaling Up Mentorship (Re:Work)", "https://rework.withgoogle.com/guides/re-teaching-people-to-give-effective-feedback/", "Guide",
                                    "Google's research-backed guide to feedback and growth.")),
                    List.of(
                            link("1:1 Meeting Templates (Fellow)", "https://fellow.app/meeting-templates/one-on-one/", "Tool",
                                    "Structured agendas that make mentoring conversations concrete."),
                            link("Feedback Rounds (Know Your Team)", "https://knowyourteam.com/", "Tool",
                                    "Tools for giving regular, honest feedback at scale."))),

            new TopicEntry("Technical writing",
                    List.of("technical writing", "writing", "rfc", "documentation", "docs",
                            "strategy doc", "case study", "communication", "blog", "essay"),
                    List.of(
                            link("Write the Docs", "https://www.writethedocs.org/guide/", "Guide",
                                    "The community standard for writing clear technical docs."),
                            link("Google Technical Writing Courses", "https://developers.google.com/tech-writing", "Course",
                                    "Free, practical — two courses on clarity, structure, and audience."),
                            link("Divio Documentation System", "https://documentation.divio.com/", "Article",
                                    "The tutorial/how-to/reference/explanation framework every doc set needs."),
                            link("The Elements of Style", "https://www.bartleby.com/lit-hub/141/", "Book",
                                    "The timeless short guide to clear prose.")),
                    List.of(
                            link("Hemingway Editor", "https://hemingwayapp.com/", "Tool",
                                    "Instantly flag long sentences and passive voice."),
                            link("Grammarly", "https://www.grammarly.com/", "Tool",
                                    "Grammar and tone checks for anything you publish."),
                            link("GitHub Markdown Guide", "https://docs.github.com/en/get-started/writing-on-github", "Tool",
                                    "The syntax you'll actually use for RFCs and READMEs."))),

            new TopicEntry("Interview skills",
                    List.of("interview", "mock interview", "behavioral", "storytelling", "resume",
                            "negotiation", "offer", "applications", "networking", "job search"),
                    List.of(
                            link("Interview Prep Roadmap", "https://roadmap.sh/leetcode", "Course",
                                    "A realistic plan for interview prep — scope, cadence, and practice."),
                            link("Cracking the Coding Interview", "https://www.crackingthecodinginterview.com/", "Book",
                                    "The classic: 189 questions with a strong behavioral section."),
                            link("The STAR Method (Indeed)", "https://www.indeed.com/career-advice/interviewing/star-interview-method", "Guide",
                                    "Structure behavioral answers: Situation, Task, Action, Result."),
                            link("Levels.fyi", "https://www.levels.fyi/", "Guide",
                                    "Real compensation data to ground your negotiation."),
                            link("Hired's Salary Negotiation Guide", "https://hired.com/blog/candidates/salary-negotiation-ebook/", "Guide",
                                    "Tactics for negotiating like a pro — without burning bridges.")),
                    List.of(
                            link("Pramp", "https://www.pramp.com/", "Practice",
                                    "Free peer mock interviews for coding and system design."),
                            link("Interviewing.io", "https://interviewing.io/", "Practice",
                                    "Anonymous practice interviews with real engineers."),
                            link("Big Interview", "https://biginterview.com/", "Practice",
                                    "Structured mock interviews with feedback."))),

            new TopicEntry("Data & analytics",
                    List.of("data", "analytics", "sql", "statistics", "statistical", "data science",
                            "machine learning", "ml", "ai", "python", "pandas", "business intelligence",
                            "visualization", "dashboards", "storytelling with data"),
                    List.of(
                            link("AI & Data Scientist Roadmap", "https://roadmap.sh/ai-data-scientist", "Course",
                                    "The full path: math, ML, tools, and deployment."),
                            link("Data Analyst Roadmap", "https://roadmap.sh/data-analyst", "Course",
                                    "SQL, statistics, and dashboarding for analysts."),
                            link("Kaggle Learn", "https://www.kaggle.com/learn", "Course",
                                    "Free micro-courses on Python, SQL, ML, and visualization."),
                            link("Storytelling with Data", "https://www.storytellingwithdata.com/", "Book",
                                    "The book that makes charts actually communicate."),
                            link("An Introduction to Statistical Learning", "https://www.statlearning.com/", "Book",
                                    "Free — the accessible companion to the ML classics.")),
                    List.of(
                            link("Kaggle", "https://www.kaggle.com/", "Practice",
                                    "Datasets and competitions to build a real portfolio."),
                            link("SQLZoo", "https://sqlzoo.net/", "Practice",
                                    "Interactive SQL tutorials from basic joins to window functions."),
                            link("Mode Analytics SQL Tutorial", "https://mode.com/sql-tutorial/", "Guide",
                                    "The most practical SQL reference for analysts."))),

            new TopicEntry("Product thinking",
                    List.of("product", "prioritization", "roadmap", "stakeholder alignment", "metrics",
                            "user research", "product manager", "pm", "backlog", "okr", "kpi"),
                    List.of(
                            link("Product Manager Roadmap", "https://roadmap.sh/product-manager", "Course",
                                    "Discovery, prioritization, and launch — the PM curriculum."),
                            link("Good Product Manager / Bad Product Manager", "https://a16z.com/2012/06/15/good-product-manager-bad-product-manager/", "Article",
                                    "Ben Horowitz's classic definition of the PM job."),
                            link("The Lean Startup", "https://theleanstartup.com/", "Book",
                                    "Build-measure-learn loops that every product org uses."),
                            link("Escaping the Build Trap", "https://melissaperri.com/", "Book",
                                    "How to focus on outcomes instead of output.")),
                    List.of(
                            link("RICE Prioritization (ProductPlan)", "https://www.productplan.com/glossary/rice-scoring-model/", "Tool",
                                    "Score features with Reach × Impact × Confidence ÷ Effort."),
                            link("Amplitude Academy", "https://amplitude.com/learn", "Course",
                                    "Free courses on product analytics and metrics."))),

            new TopicEntry("Career strategy",
                    List.of("career", "growth", "promotion", "gap", "skill gap", "professional development",
                            "goals", "portfolio", "personal brand", "job search", "applications"),
                    List.of(
                            link("StaffEng Career Guides", "https://staffeng.com/guides/", "Guide",
                                    "Evidence-based guides for promotion and growth at senior+ levels."),
                            link("The Engineering Manager's Career Guide", "https://www.levels.fyi/blog/engineering-manager-guide.html", "Article",
                                    "How IC roles map to management tracks and expectations."),
                            link("Career Growth — Google Re:Work", "https://rework.withgoogle.com/en/guides/", "Guide",
                                    "Research-backed advice on goals, feedback, and growth."),
                            link("Designing Your Life", "https://designingyour.life/", "Book",
                                    "The Stanford course on prototyping your career.")),
                    List.of(
                            link("O*NET OnLine", "https://www.onetonline.org/", "Tool",
                                    "Government data on what every occupation actually requires."),
                            link("Gap Analysis Template (Notion)", "https://www.notion.com/templates/career-development", "Tool",
                                    "Score yourself against job requirements and track the plan.")))
    );

    /** The full catalog, ready for JSON serialization. */
    public List<Map<String, Object>> catalog() {
        List<Map<String, Object>> topics = new ArrayList<>();
        for (TopicEntry entry : CATALOG) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("topic", entry.topic);
            m.put("keywords", entry.keywords);
            m.put("resources", links(entry.resources));
            m.put("tools", links(entry.tools));
            topics.add(m);
        }
        return topics;
    }

    /**
     * Match a phrase (a roadmap segment's title + focus + skills) against the
     * catalog. Returns the matched topics sorted by relevance plus the
     * deduped resources and tools collected across those matches — the same
     * logic the frontend used to run locally, now shared by every client.
     */
    public Map<String, Object> match(String text, int maxResults) {
        String haystack = normalize(text);
        List<Map<String, Object>> matches = new ArrayList<>();
        for (TopicEntry entry : CATALOG) {
            int count = 0;
            for (String keyword : entry.keywords) {
                if (keywordMatches(haystack, keyword)) count++;
            }
            if (count > 0) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("topic", entry.topic);
                m.put("matchCount", count);
                matches.add(m);
            }
        }
        matches.sort((a, b) -> ((Number) b.get("matchCount")).intValue()
                - ((Number) a.get("matchCount")).intValue());
        if (matches.size() > maxResults) matches = matches.subList(0, maxResults);

        // Collect links from the matched topics, deduped by URL.
        List<CatalogLink> resources = new ArrayList<>();
        List<CatalogLink> tools = new ArrayList<>();
        java.util.Set<String> seen = new java.util.LinkedHashSet<>();
        for (Map<String, Object> match : matches) {
            TopicEntry entry = byTopic(String.valueOf(match.get("topic")));
            if (entry == null) continue;
            for (CatalogLink l : entry.resources) addUnique(seen, resources, l);
            for (CatalogLink l : entry.tools) addUnique(seen, tools, l);
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("matches", matches);
        out.put("resources", links(resources));
        out.put("tools", links(tools));
        return out;
    }

    private TopicEntry byTopic(String topic) {
        for (TopicEntry entry : CATALOG) {
            if (entry.topic.equals(topic)) return entry;
        }
        return null;
    }

    private static void addUnique(java.util.Set<String> seen, List<CatalogLink> out, CatalogLink l) {
        if (seen.add(l.url)) out.add(l);
    }

    private static List<Map<String, Object>> links(List<CatalogLink> list) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (CatalogLink l : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", l.title);
            m.put("url", l.url);
            m.put("kind", l.kind);
            m.put("note", l.note);
            out.add(m);
        }
        return out;
    }

    // ------------------------------------------------------------ matching

    /** Normalize a phrase: lowercase, strip punctuation, collapse whitespace. */
    private static String normalize(String value) {
        if (value == null) return "";
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9+#.\\- ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Multi-word/long keywords match as substrings ("data structure" hits
     * "data structures"). Very short keywords (2 chars) could match inside
     * unrelated words ("ai" in "detail"), so those require word boundaries.
     */
    private static boolean keywordMatches(String haystack, String keyword) {
        if (keyword.length() <= 2) {
            return Pattern.compile("\\b" + Pattern.quote(keyword) + "\\b").matcher(haystack).find();
        }
        return haystack.contains(keyword);
    }
}
