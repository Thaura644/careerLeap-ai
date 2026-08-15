package com.leapai.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.model.Problem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.PrintStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Runs a user's Java solution against a problem's real (hidden) test cases.
 *
 * <p>How it works: the user writes {@code public class Solution} with the
 * problem's static method. We compile it in-process (javac from the JDK) into
 * a throwaway temp directory together with a generated harness, then execute
 * the harness in a subprocess with a hard memory cap ({@code -Xmx}) and a hard
 * wall-clock timeout. Test cases are embedded in the harness as Java-literal
 * call expressions — the same trusted data the seed defines — and each result
 * is compared against the expected canonical string.
 *
 * <p>Verdicts: ACCEPTED, WRONG_ANSWER, COMPILE_ERROR, RUNTIME_ERROR,
 * TIME_LIMIT_EXCEEDED. Never mocked: every verdict comes from running the code.
 */
@Service
public class JudgeService {

    private static final Logger log = LoggerFactory.getLogger(JudgeService.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * @return map with keys: verdict, passed, total, runtimeMs, detail,
     *         cases (list of {case, ok, runtimeMs, error}) — or a compile error
     *         payload (verdict=COMPILE_ERROR, detail=...).
     */
    public Map<String, Object> judge(Problem problem, String userCode, boolean includeCases) {
        return judge(problem, userCode, problem.getTestCasesJson(), includeCases);
    }

    /** Judge against an explicit test-case JSON (sample cases for "Run", hidden for "Submit"). */
    public Map<String, Object> judge(Problem problem, String userCode, String testCasesJson, boolean includeCases) {
        String cleaned = userCode == null ? "" : userCode.trim();
        if (cleaned.isEmpty()) {
            return error("COMPILE_ERROR", "No code submitted.");
        }
        if (!cleaned.contains("class Solution")) {
            return error("COMPILE_ERROR",
                    "Your code must contain a `public class Solution` — write your solution inside that class.");
        }

        Path dir = null;
        try {
            dir = Files.createTempDirectory("leap-judge-");
            Path classes = dir.resolve("classes");
            Files.createDirectories(classes);

            Path solutionSrc = dir.resolve("Solution.java");
            Path harnessSrc = dir.resolve("LeapJudge.java");
            Files.writeString(solutionSrc, cleaned, StandardCharsets.UTF_8);
            Files.writeString(harnessSrc, buildHarness(testCasesJson), StandardCharsets.UTF_8);

            List<String> compileErrors = compile(dir, classes);
            if (!compileErrors.isEmpty()) {
                return error("COMPILE_ERROR", String.join("\n", compileErrors));
            }

            return execute(problem, classes, includeCases);
        } catch (IOException e) {
            log.warn("[judge] io failure: {}", e.getMessage());
            return error("RUNTIME_ERROR", "Judge infrastructure error: " + e.getMessage());
        } finally {
            if (dir != null) deleteRecursively(dir);
        }
    }

    // ------------------------------------------------------------------ compile

    private List<String> compile(Path srcDir, Path classesDir) {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            return List.of("No JDK compiler available on this server (JRE only).");
        }
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        List<String> errors = new ArrayList<>();
        try (StandardJavaFileManager fm = compiler.getStandardFileManager(diagnostics, null, StandardCharsets.UTF_8)) {
            fm.setLocation(javax.tools.StandardLocation.CLASS_OUTPUT, List.of(classesDir.toFile()));
            Iterable<? extends JavaFileObject> units = fm.getJavaFileObjectsFromFiles(List.of(
                    srcDir.resolve("Solution.java").toFile(),
                    srcDir.resolve("LeapJudge.java").toFile()));
            Boolean ok = compiler.getTask(null, fm, diagnostics, List.of("-encoding", "UTF-8"), null, units).call();
            if (Boolean.TRUE.equals(ok)) return errors;
            for (Diagnostic<? extends JavaFileObject> d : diagnostics.getDiagnostics()) {
                if (d.getKind() == javax.tools.Diagnostic.Kind.ERROR) {
                    String line = d.getLineNumber() > 0 ? "line " + d.getLineNumber() + ": " : "";
                    errors.add(line + d.getMessage(null));
                }
            }
            if (errors.isEmpty()) errors.add("Compilation failed (unknown error).");
            return errors;
        } catch (IOException e) {
            return List.of("Compilation failed: " + e.getMessage());
        }
    }

    // ------------------------------------------------------------------ harness

    /**
     * Builds LeapJudge.java that calls the user's method for each test case.
     * Test-case JSON shape (trusted seed data):
     * [{"call": "Solution.twoSum(new int[]{2,7,11,15}, 9)", "expected": "[0, 1]"}, ...]
     */
    private String buildHarness(String testCasesJson) throws IOException {
        JsonNode cases = objectMapper.readTree(testCasesJson);
        StringBuilder body = new StringBuilder();
        for (int i = 0; i < cases.size(); i++) {
            JsonNode c = cases.get(i);
            String call = c.path("call").asText();
            String expected = c.path("expected").asText();
            body.append("        try {\n");
            body.append("            long t0 = System.nanoTime();\n");
            body.append("            Object actual = ").append(call).append(";\n");
            body.append("            long ms = (System.nanoTime() - t0) / 1_000_000L;\n");
            body.append("            worst = Math.max(worst, ms);\n");
            body.append("            String got = canon(actual);\n");
            body.append("            boolean ok = got.equals(").append(javaString(expected)).append(");\n");
            body.append("            if (ok) passed++;\n");
            body.append("            sb.append('\\n').append(").append(i).append(").append('|')");
            body.append(".append(ok ? '0' : '1').append('|').append(ms).append('|')");
            body.append(".append(ok ? \"\" : got).append('|').append(ok ? \"\" : ").append(javaString(expected)).append(");\n");
            body.append("        } catch (Throwable t) {\n");
            body.append("            sb.append('\\n').append(").append(i).append(").append(\"|2|0|\").append(String.valueOf(t).replace('\\n', ' ')).append('|');\n");
            body.append("        }\n");
        }
        return "import java.util.*;\n"
                + "public class LeapJudge {\n"
                + "    static int passed = 0;\n"
                + "    static long worst = 0;\n"
                + "    static final int TOTAL = " + cases.size() + ";\n"
                + "    static StringBuilder sb = new StringBuilder();\n"
                + "    public static void main(String[] args) {\n"
                + "        try {\n"
                + body
                + "        } catch (Throwable t) { sb.append('\\n').append(\"fatal|\").append(String.valueOf(t)); }\n"
                + "        System.out.print(\"PASSED=\" + passed + \"\\nWORST=\" + worst + \"\\nCASES=\" + TOTAL + sb);\n"
                + "    }\n"
                + "    static String canon(Object o) {\n"
                + "        if (o == null) return \"null\";\n"
                + "        if (o instanceof Object[]) return Arrays.deepToString((Object[]) o);\n"
                + "        if (o instanceof int[]) return Arrays.toString((int[]) o);\n"
                + "        if (o instanceof long[]) return Arrays.toString((long[]) o);\n"
                + "        if (o instanceof double[]) return Arrays.toString((double[]) o);\n"
                + "        if (o instanceof char[]) return Arrays.toString((char[]) o);\n"
                + "        if (o instanceof boolean[]) return Arrays.toString((boolean[]) o);\n"
                + "        if (o instanceof byte[]) return Arrays.toString((byte[]) o);\n"
                + "        if (o instanceof float[]) return Arrays.toString((float[]) o);\n"
                + "        if (o instanceof short[]) return Arrays.toString((short[]) o);\n"
                + "        return String.valueOf(o);\n"
                + "    }\n"
                + "}\n";
    }

    /** Returns s as a valid Java double-quoted string literal. */
    private static String javaString(String s) {
        StringBuilder out = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '\\' -> out.append("\\\\");
                case '"' -> out.append("\\\"");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> out.append(ch);
            }
        }
        return out.append('"').toString();
    }

    // ------------------------------------------------------------------ execute

    private Map<String, Object> execute(Problem problem, Path classes, boolean includeCases) {
        long limitSeconds = Math.max(3, (problem.getTimeLimitMs() * 3L) / 1000L); // headroom over per-case limit
        List<String> cmd = new ArrayList<>(List.of(
                javaBin(), "-Xmx" + problem.getMemoryLimitMb() + "m",
                "-Djava.awt.headless=true",
                "-cp", classes.toString(), "LeapJudge"));
        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(false);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        Process process;
        try {
            process = pb.start();
        } catch (IOException e) {
            return error("RUNTIME_ERROR", "Failed to start judge process: " + e.getMessage());
        }
        // Drain stdout/stderr concurrently so a chatty solution can't deadlock the pipe.
        Thread outDrain = new Thread(() -> { try { process.getInputStream().transferTo(out); } catch (IOException ignored) {} });
        Thread errDrain = new Thread(() -> { try { process.getErrorStream().transferTo(err); } catch (IOException ignored) {} });
        outDrain.start();
        errDrain.start();

        boolean finished;
        try {
            finished = process.waitFor(limitSeconds, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            return error("TIME_LIMIT_EXCEEDED", "Judge was interrupted.");
        }
        if (!finished) {
            process.destroyForcibly();
            return error("TIME_LIMIT_EXCEEDED", "Your solution exceeded the time limit on at least one test case.");
        }
        try {
            outDrain.join(3000);
            errDrain.join(3000);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
        String stdout = out.toString(StandardCharsets.UTF_8);
        String stderr = err.toString(StandardCharsets.UTF_8);

        if (process.exitValue() != 0 && !stdout.contains("PASSED=")) {
            String detail = stderr.isBlank() ? stdout : stderr;
            return error("RUNTIME_ERROR", "Your program crashed:\n" + detail.trim());
        }
        return parseOutput(stdout, problem, includeCases);
    }

    /** java binary: JAVA_HOME/bin/java if set, else "java" on PATH. */
    private String javaBin() {
        String home = System.getenv("JAVA_HOME");
        if (home != null && !home.isBlank()) {
            return home + File.separator + "bin" + File.separator + "java";
        }
        return "java";
    }

    /**
     * Harness stdout format:
     *   PASSED=<n>
     *   WORST=<ms>
     *   CASES=<n>
     *   <caseIndex>|<kind>|<ms>|<detail>|<expected>   kind 0=pass, 1=fail, 2=exception
     */
    private Map<String, Object> parseOutput(String stdout, Problem problem, boolean includeCases) {
        String[] lines = stdout.split("\\r?\\n");
        int passed = 0;
        int total = 0;
        long worst = 0;
        for (String line : lines) {
            if (line.startsWith("PASSED=")) {
                try { passed = Integer.parseInt(line.substring("PASSED=".length())); } catch (NumberFormatException ignored) {}
            } else if (line.startsWith("CASES=")) {
                try { total = Integer.parseInt(line.substring("CASES=".length())); } catch (NumberFormatException ignored) {}
            } else if (line.startsWith("WORST=")) {
                try { worst = Long.parseLong(line.substring("WORST=".length())); } catch (NumberFormatException ignored) {}
            }
        }
        boolean allOk = passed == total && total > 0;

        List<Map<String, Object>> cases = new ArrayList<>();
        String detail = null;
        for (String line : lines) {
            if (!line.contains("|")) continue;
            String[] parts = line.split("\\|", 5);
            if (parts.length < 3) continue;
            String idx = parts[0];
            String kind = parts[1];
            long ms = 0;
            try { ms = Long.parseLong(parts[2]); } catch (NumberFormatException ignored) {}
            Map<String, Object> c = new LinkedHashMap<>();
            c.put("case", idx);
            c.put("ok", "0".equals(kind));
            c.put("runtimeMs", ms);
            if ("2".equals(kind)) {
                c.put("error", parts.length > 3 ? parts[3] : "error");
                if (detail == null) detail = "Test case " + idx + " threw: " + (parts.length > 3 ? parts[3] : "error");
            } else if ("1".equals(kind)) {
                c.put("actual", parts.length > 3 ? parts[3] : "");
                c.put("expected", parts.length > 4 ? parts[4] : "");
                if (detail == null) detail = "Test case " + idx + ": got " + (parts.length > 3 ? parts[3] : "") + ", expected " + (parts.length > 4 ? parts[4] : "");
            }
            if (includeCases) cases.add(c);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        if (allOk) {
            result.put("verdict", "ACCEPTED");
        } else if (detail != null && detail.contains("threw")) {
            result.put("verdict", "RUNTIME_ERROR");
        } else {
            result.put("verdict", "WRONG_ANSWER");
        }
        result.put("passed", passed);
        result.put("total", total);
        result.put("runtimeMs", worst);
        result.put("detail", allOk ? null : (detail == null ? "No test results received from judge." : detail));
        if (includeCases) result.put("cases", cases);
        return result;
    }

    private Map<String, Object> error(String verdict, String detail) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("verdict", verdict);
        m.put("passed", 0);
        m.put("total", 0);
        m.put("runtimeMs", 0L);
        m.put("detail", detail);
        return m;
    }

    private void deleteRecursively(Path dir) {
        try {
            Files.walk(dir)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> { try { Files.deleteIfExists(p); } catch (IOException ignored) {} });
        } catch (IOException ignored) {
        }
    }
}
