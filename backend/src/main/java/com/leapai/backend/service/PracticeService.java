package com.leapai.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.config.ForbiddenException;
import com.leapai.backend.model.Problem;
import com.leapai.backend.model.Roadmap;
import com.leapai.backend.model.Submission;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.ProblemRepository;
import com.leapai.backend.repository.RoadmapRepository;
import com.leapai.backend.repository.SubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Practice problems + judging. The judge is real (compiles and runs user code
 * against hidden tests); submissions are persisted so "solved" is a durable,
 * per-user fact derived from actual ACCEPTED verdicts — never a localStorage
 * flag.
 *
 * <p>Every problem carries a roadmap recommendation: problems whose topics
 * match the user's generated roadmap are flagged {@code recommended} with a
 * human-readable reason (the "practices necessary to your roadmap"). The rest
 * are the "explore" pool — Pro-gated: free users can see them but cannot open
 * or run them (enforced server-side, not just hidden in the UI).
 */
@Service
public class PracticeService {

    private static final Logger log = LoggerFactory.getLogger(PracticeService.class);

    private final ProblemRepository problems;
    private final SubmissionRepository submissions;
    private final RoadmapRepository roadmaps;
    private final PaymentService payments;
    private final JudgeService judge;
    private final ObjectMapper objectMapper;

    public PracticeService(ProblemRepository problems, SubmissionRepository submissions,
                           RoadmapRepository roadmaps, PaymentService payments,
                           JudgeService judge, ObjectMapper objectMapper) {
        this.problems = problems;
        this.submissions = submissions;
        this.roadmaps = roadmaps;
        this.payments = payments;
        this.judge = judge;
        this.objectMapper = objectMapper;
    }

    /**
     * Keywords per problem (slug → lowercase topics) used to match problems to
     * the user's roadmap skills. Derived from each problem's category/topic.
     */
    private static final Map<String, List<String>> PROBLEM_KEYWORDS = Map.ofEntries(
            Map.entry("two-sum", List.of("array", "hash", "hash map", "two sum")),
            Map.entry("valid-parentheses", List.of("stack", "parenthes", "string")),
            Map.entry("contains-duplicate", List.of("array", "hash", "hash map", "duplicate")),
            Map.entry("palindrome-number", List.of("math", "palindrome")),
            Map.entry("binary-search", List.of("binary search", "search", "divide and conquer")),
            Map.entry("best-time-to-buy-sell-stock", List.of("array", "two pointer", "stock", "sliding window")),
            Map.entry("maximum-subarray", List.of("dynamic programming", "subarray", "kadane")),
            Map.entry("reverse-string", List.of("string", "two pointer")),
            Map.entry("climbing-stairs", List.of("dynamic programming", "stairs", "fibonacci")),
            Map.entry("valid-anagram", List.of("hash", "hash map", "anagram", "sort")),
            Map.entry("merge-two-sorted-lists", List.of("linked list", "list", "merge")),
            Map.entry("invert-binary-tree", List.of("tree", "binary tree", "recursion", "dfs")),
            Map.entry("linked-list-cycle", List.of("linked list", "list", "two pointer", "cycle")),
            Map.entry("longest-common-prefix", List.of("string", "prefix", "trie")),
            Map.entry("house-robber", List.of("dynamic programming", "dp", "robber")),
            Map.entry("majority-element", List.of("array", "hash", "hash map", "majority")),
            Map.entry("container-with-most-water", List.of("two pointer", "array", "greedy", "water")),
            Map.entry("coin-change", List.of("dynamic programming", "dp", "coin", "knapsack")),
            Map.entry("trapping-rain-water", List.of("two pointer", "array", "stack", "water"))
    );

    /**
     * Roadmap phrases that signal the user needs coding-interview practice. When
     * present, the classic EASY problems become the "interview-prep foundation"
     * recommendation; MEDIUM/HARD stay in the Pro-gated explore pool.
     */
    private static final List<String> CODING_SIGNALS = List.of(
            "interview", "leetcode", "coding", "algorithm", "data structure",
            "problem solving", "problem-solving", "technical screen"
    );

    public List<Map<String, Object>> list(User user) {
        String haystack = roadmapHaystack(user);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Problem p : problems.findAllByOrderByDifficultyAscIdAsc()) {
            out.add(dto(p, user, haystack, false));
        }
        return out;
    }

    /** Detail for the editor page: statement, starter code, sample cases — never the hidden tests. */
    public Map<String, Object> detail(String slug, User user) {
        Problem p = problems.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + slug));
        requireAccess(p, user);
        String haystack = roadmapHaystack(user);
        Map<String, Object> m = dto(p, user, haystack, true);
        // Sample cases as a real array (the display shows them as the "expected"
        // values); hidden tests are never returned.
        m.put("samples", parseJsonArray(p.getSampleCasesJson()));
        return m;
    }

    /** "Run" — judge the code against the visible sample cases; nothing persisted. */
    public Map<String, Object> run(String slug, String code, User user) {
        Problem p = problems.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + slug));
        requireAccess(p, user);
        Map<String, Object> result = judge.judge(p, code, p.getSampleCasesJson(), true);
        result.put("run", "sample");
        return result;
    }

    /** "Submit" — judge against the hidden tests and persist the result. */
    @Transactional
    public Map<String, Object> submit(String slug, String code, User user) {
        Problem p = problems.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + slug));
        requireAccess(p, user);
        Map<String, Object> result = judge.judge(p, code, true);
        Submission s = new Submission();
        s.setUser(user);
        s.setProblem(p);
        s.setCode(code);
        s.setVerdict(String.valueOf(result.get("verdict")));
        s.setPassed(((Number) result.getOrDefault("passed", 0)).intValue());
        s.setTotal(((Number) result.getOrDefault("total", 0)).intValue());
        s.setRuntimeMs(((Number) result.getOrDefault("runtimeMs", 0L)).longValue());
        s.setDetail((String) result.get("detail"));
        submissions.save(s);
        result.put("submissionId", s.getId());
        result.put("solved", solved(p, user));
        log.info("[practice] {} submitted {} -> {} ({}/{})", user.getEmail(), slug, s.getVerdict(), s.getPassed(), s.getTotal());
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> progress(User user) {
        long total = problems.count();
        long solved = 0;
        for (Problem p : problems.findAll()) {
            if (solved(p, user)) solved++;
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("total", total);
        m.put("solved", solved);
        List<Map<String, Object>> recent = new ArrayList<>();
        for (Submission s : submissions.findByUserIdOrderByCreatedAtDesc(user.getId())) {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("problem", s.getProblem().getSlug());
            r.put("title", s.getProblem().getTitle());
            r.put("verdict", s.getVerdict());
            r.put("passed", s.getPassed());
            r.put("total", s.getTotal());
            r.put("runtimeMs", s.getRuntimeMs());
            r.put("createdAt", s.getCreatedAt().toString());
            recent.add(r);
        }
        m.put("recent", recent);
        return m;
    }

    // ------------------------------------------------------------ recommendation

    /**
     * Problems tied to the user's roadmap (the "practices necessary to it") are
     * recommended and free. Everything else is the explore pool, which requires
     * Pro to open or run.
     */
    private void requireAccess(Problem p, User user) {
        if (recommendation(p, roadmapHaystack(user)).recommended) return;
        if (payments.isPro(user)) return;
        throw new ForbiddenException(
                "This problem is in the explore pool — upgrade to Pro to unlock it.");
    }

    /** Builds the problem DTO with solved state, recommendation flag, and reason. */
    private Map<String, Object> dto(Problem p, User user, String haystack, boolean includeCode) {
        Recommendation rec = recommendation(p, haystack);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("slug", p.getSlug());
        m.put("title", p.getTitle());
        m.put("difficulty", p.getDifficulty().name());
        m.put("category", p.getCategory());
        m.put("signature", p.getSignature());
        m.put("solved", solved(p, user));
        m.put("lastVerdict", lastVerdict(p, user));
        m.put("recommended", rec.recommended);
        m.put("reason", rec.reason);
        if (includeCode) {
            m.put("description", p.getDescription());
            m.put("starterCode", p.getStarterCode());
            m.put("timeLimitMs", p.getTimeLimitMs());
            m.put("memoryLimitMb", p.getMemoryLimitMb());
        }
        return m;
    }

    private Recommendation recommendation(Problem p, String haystack) {
        // Direct match: a problem topic appears in the roadmap's skills/phases.
        List<String> keywords = PROBLEM_KEYWORDS.getOrDefault(p.getSlug(), List.of());
        for (String kw : keywords) {
            if (haystack.contains(kw)) {
                return new Recommendation(true, "Matches a skill in your roadmap (" + kw + ")");
            }
        }
        // Coding-practice intent: the roadmap mentions interview/algorithm prep
        // (or there is no roadmap yet) — the classic EASY problems are the
        // foundation to build before the harder explore pool.
        boolean codingIntent = haystack.isBlank();
        if (!codingIntent) {
            for (String signal : CODING_SIGNALS) {
                if (haystack.contains(signal)) {
                    codingIntent = true;
                    break;
                }
            }
        }
        if (codingIntent && p.getDifficulty() == Problem.Difficulty.EASY) {
            return new Recommendation(true, haystack.isBlank()
                    ? "The classic starter set — build your fundamentals"
                    : "Part of your roadmap's interview-prep foundation");
        }
        return new Recommendation(false, null);
    }

    /**
     * Lowercased concatenation of every phase's title, focus, and skills from
     * the user's most recent roadmap — the text recommendations are matched
     * against. Empty when the user has no roadmap yet.
     */
    private String roadmapHaystack(User user) {
        Roadmap roadmap = roadmaps.findFirstByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
        if (roadmap == null) return "";
        try {
            Map<String, Object> content = objectMapper.readValue(roadmap.getContent(),
                    new TypeReference<Map<String, Object>>() {});
            Object phasesObj = content.get("phases");
            if (!(phasesObj instanceof List)) return "";
            StringBuilder sb = new StringBuilder();
            for (Object o : (List<?>) phasesObj) {
                if (!(o instanceof Map)) continue;
                Map<?, ?> phase = (Map<?, ?>) o;
                appendLower(sb, phase.get("title"));
                appendLower(sb, phase.get("focus"));
                Object skills = phase.get("skills");
                if (skills instanceof List) {
                    for (Object s : (List<?>) skills) appendLower(sb, s);
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private void appendLower(StringBuilder sb, Object value) {
        if (value == null) return;
        String s = String.valueOf(value).toLowerCase(Locale.ROOT);
        if (!s.isBlank()) sb.append(' ').append(s);
    }

    // ------------------------------------------------------------------- state

    private boolean solved(Problem p, User user) {
        return submissions.existsByUserIdAndProblemIdAndVerdict(user.getId(), p.getId(), "ACCEPTED");
    }

    private String lastVerdict(Problem p, User user) {
        return submissions.findFirstByUserIdAndProblemIdOrderByCreatedAtDesc(user.getId(), p.getId())
                .map(Submission::getVerdict).orElse(null);
    }

    private List<?> parseJsonArray(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            var node = new ObjectMapper().readTree(json);
            if (node.isArray()) {
                return new ObjectMapper().convertValue(node, List.class);
            }
        } catch (Exception ignored) {
        }
        return List.of();
    }

    private static final class Recommendation {
        final boolean recommended;
        final String reason;

        Recommendation(boolean recommended, String reason) {
            this.recommended = recommended;
            this.reason = reason;
        }
    }
}
