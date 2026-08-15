package com.leapai.backend.service;

import com.leapai.backend.model.Problem;
import com.leapai.backend.model.Submission;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.ProblemRepository;
import com.leapai.backend.repository.SubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Practice problems + judging. The judge is real (compiles and runs user code
 * against hidden tests); submissions are persisted so "solved" is a durable,
 * per-user fact derived from actual ACCEPTED verdicts — never a localStorage
 * flag.
 */
@Service
public class PracticeService {

    private static final Logger log = LoggerFactory.getLogger(PracticeService.class);

    private final ProblemRepository problems;
    private final SubmissionRepository submissions;
    private final JudgeService judge;

    public PracticeService(ProblemRepository problems, SubmissionRepository submissions, JudgeService judge) {
        this.problems = problems;
        this.submissions = submissions;
        this.judge = judge;
    }

    public List<Map<String, Object>> list(User user) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Problem p : problems.findAllByOrderByDifficultyAscIdAsc()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("slug", p.getSlug());
            m.put("title", p.getTitle());
            m.put("difficulty", p.getDifficulty().name());
            m.put("category", p.getCategory());
            m.put("signature", p.getSignature());
            m.put("solved", solved(p, user));
            m.put("lastVerdict", lastVerdict(p, user));
            out.add(m);
        }
        return out;
    }

    /** Detail for the editor page: statement, starter code, sample cases — never the hidden tests. */
    public Map<String, Object> detail(String slug, User user) {
        Problem p = problems.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + slug));
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("slug", p.getSlug());
        m.put("title", p.getTitle());
        m.put("difficulty", p.getDifficulty().name());
        m.put("category", p.getCategory());
        m.put("signature", p.getSignature());
        m.put("description", p.getDescription());
        m.put("starterCode", p.getStarterCode());
        m.put("timeLimitMs", p.getTimeLimitMs());
        m.put("memoryLimitMb", p.getMemoryLimitMb());
        m.put("solved", solved(p, user));
        // Sample cases as a real array (the display shows them as the "expected"
        // values); hidden tests are never returned.
        m.put("samples", parseJsonArray(p.getSampleCasesJson()));
        return m;
    }

    /** "Run" — judge the code against the visible sample cases; nothing persisted. */
    public Map<String, Object> run(String slug, String code) {
        Problem p = problems.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + slug));
        Map<String, Object> result = judge.judge(p, code, p.getSampleCasesJson(), true);
        result.put("run", "sample");
        return result;
    }

    /** "Submit" — judge against the hidden tests and persist the result. */
    @Transactional
    public Map<String, Object> submit(String slug, String code, User user) {
        Problem p = problems.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + slug));
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
            var node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(json);
            if (node.isArray()) {
                return new com.fasterxml.jackson.databind.ObjectMapper().convertValue(node, List.class);
            }
        } catch (Exception ignored) {
        }
        return List.of();
    }
}
