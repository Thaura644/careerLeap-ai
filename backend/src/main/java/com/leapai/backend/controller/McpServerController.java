package com.leapai.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.model.User;
import com.leapai.backend.service.CreditService;
import com.leapai.backend.service.McpTokenService;
import com.leapai.backend.service.PaymentService;
import com.leapai.backend.service.PracticeScenarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * A real MCP (Model Context Protocol) server for Leap.ai — lets an MCP
 * client (Claude, ChatGPT via its Apps SDK, or any other MCP-compatible AI
 * assistant) connect to one user's own account and read their real career
 * data. Not a login mechanism: this is the AI calling out to Leap.ai on the
 * user's behalf, authorized by a personal access token they generate in
 * Settings (see McpTokenController) — the direction MCP actually works in.
 *
 * <p>Stateless JSON-RPC 2.0 over plain HTTP POST (the simplest valid form of
 * the MCP "Streamable HTTP" transport — no server-side session required
 * since the bearer token already identifies the caller on every request).
 *
 * <p>Not implemented: OAuth 2.1 dynamic client registration. A hand-rolled
 * authorization server is a real security surface, and a bearer PAT is the
 * same trust model GitHub/Stripe ship for their own AI/API integrations —
 * correct and secure today. Dynamic OAuth is a valid future upgrade, not a
 * requirement for this to work with Claude Code, Claude Desktop's custom
 * connectors, or any client that accepts a static bearer token.
 */
@RestController
@RequestMapping("/api/mcp")
public class McpServerController {

    private static final Logger log = LoggerFactory.getLogger(McpServerController.class);
    private static final String PROTOCOL_VERSION = "2025-06-18";

    private final McpTokenService tokenService;
    private final PracticeScenarioService scenarios;
    private final CreditService credits;
    private final PaymentService payments;
    private final ObjectMapper objectMapper;

    public McpServerController(McpTokenService tokenService, PracticeScenarioService scenarios,
                                CreditService credits, PaymentService payments, ObjectMapper objectMapper) {
        this.tokenService = tokenService;
        this.scenarios = scenarios;
        this.credits = credits;
        this.payments = payments;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> handle(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                                        @RequestBody Map<String, Object> body) {
        Object id = body.get("id");
        String method = String.valueOf(body.get("method"));

        // Notifications (no "id") get no JSON-RPC response at all — 202 and done.
        boolean isNotification = id == null;

        String bearer = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
        Optional<User> user = tokenService.verify(bearer);
        if (user.isEmpty()) {
            if (isNotification) return ResponseEntity.status(HttpStatus.ACCEPTED).build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(rpcError(id, -32001, "Missing or invalid Leap.ai access token. Generate one in Settings → Connect AI assistants."));
        }

        try {
            switch (method) {
                case "initialize":
                    return ResponseEntity.ok(rpcResult(id, Map.of(
                            "protocolVersion", PROTOCOL_VERSION,
                            "capabilities", Map.of("tools", Map.of()),
                            "serverInfo", Map.of("name", "leap-ai", "version", "1.0.0"))));

                case "notifications/initialized":
                    return ResponseEntity.status(HttpStatus.ACCEPTED).build();

                case "tools/list":
                    return ResponseEntity.ok(rpcResult(id, Map.of("tools", toolDefinitions())));

                case "tools/call":
                    return ResponseEntity.ok(rpcResult(id, callTool(body, user.get())));

                default:
                    if (isNotification) return ResponseEntity.status(HttpStatus.ACCEPTED).build();
                    return ResponseEntity.ok(rpcError(id, -32601, "Method not found: " + method));
            }
        } catch (Exception e) {
            log.warn("[mcp] {} failed for user {}: {}", method, user.get().getId(), e.getMessage());
            if (isNotification) return ResponseEntity.status(HttpStatus.ACCEPTED).build();
            return ResponseEntity.ok(rpcError(id, -32000, "Tool call failed: " + e.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callTool(Map<String, Object> body, User user) {
        Map<String, Object> params = (Map<String, Object>) body.getOrDefault("params", Map.of());
        String name = String.valueOf(params.get("name"));

        Object data = switch (name) {
            case "get_career_profile" -> careerProfile(user);
            case "list_practice_scenarios" -> Map.of("scenarios", scenarios.list(user));
            case "get_plan_and_credits" -> planAndCredits(user);
            default -> throw new IllegalArgumentException("Unknown tool: " + name);
        };

        return Map.of("content", List.of(Map.of("type", "text", "text", toJson(data))));
    }

    private Map<String, Object> careerProfile(User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("fullName", user.getFullName());
        m.put("currentRole", user.getCurrentRole());
        m.put("targetRole", user.getTargetRole());
        m.put("industry", user.getIndustry());
        m.put("yearsExperience", user.getYearsExperience());
        m.put("timeframe", user.getTimeframe());
        m.put("aspirations", user.getAspirations());
        m.put("location", user.getLocation());
        return m;
    }

    private Map<String, Object> planAndCredits(User user) {
        Map<String, Object> m = new LinkedHashMap<>(credits.status(user));
        m.put("pro", payments.isPro(user));
        return m;
    }

    private List<Map<String, Object>> toolDefinitions() {
        Map<String, Object> emptySchema = Map.of("type", "object", "properties", Map.of());
        List<Map<String, Object>> tools = new ArrayList<>();
        tools.add(Map.of(
                "name", "get_career_profile",
                "description", "Get the signed-in Leap.ai user's career profile: current role, target role, industry, timeframe, and aspirations.",
                "inputSchema", emptySchema));
        tools.add(Map.of(
                "name", "list_practice_scenarios",
                "description", "List the user's real-world practice scenarios (case studies, build projects, interview & exam prep) with access state.",
                "inputSchema", emptySchema));
        tools.add(Map.of(
                "name", "get_plan_and_credits",
                "description", "Get the user's current plan (Free/Pro) and remaining AI credits for this month.",
                "inputSchema", emptySchema));
        return tools;
    }

    private Map<String, Object> rpcResult(Object id, Object result) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("jsonrpc", "2.0");
        m.put("id", id);
        m.put("result", result);
        return m;
    }

    private Map<String, Object> rpcError(Object id, int code, String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("jsonrpc", "2.0");
        m.put("id", id);
        m.put("error", Map.of("code", code, "message", message));
        return m;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "{}";
        }
    }
}
