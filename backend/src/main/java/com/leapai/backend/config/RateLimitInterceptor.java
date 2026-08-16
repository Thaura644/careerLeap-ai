package com.leapai.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lightweight in-memory rate limiting (fixed one-minute window per key).
 * Stricter limits on auth endpoints (login brute-force) and the AI chat
 * (expensive LLM calls); a generous default for everything else. Keys on the
 * client IP (respecting X-Forwarded-For behind a proxy). Good enough for an
 * early-stage app; swap for a distributed store (Upstash/Redis) when scaling.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);

    private static final long WINDOW_MS = 60_000L;
    private static final int MAX_KEYS = 20_000;

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final int authPerMinute;
    private final int chatPerMinute;
    private final int defaultPerMinute;

    public RateLimitInterceptor(
            @Value("${leapai.rate-limit.auth-per-minute:10}") int authPerMinute,
            @Value("${leapai.rate-limit.chat-per-minute:30}") int chatPerMinute,
            @Value("${leapai.rate-limit.default-per-minute:300}") int defaultPerMinute) {
        this.authPerMinute = authPerMinute;
        this.chatPerMinute = chatPerMinute;
        this.defaultPerMinute = defaultPerMinute;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        // CORS preflight is browser machinery, not abuse.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            return true;
        }

        int limit = defaultPerMinute;
        if (path.startsWith("/api/ai/chat")) {
            limit = chatPerMinute;
        } else if (path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/signup")
                || path.startsWith("/api/auth/profile") && isWrite(request)) {
            // Credential endpoints get the strict brute-force limit. Read-only
            // auth calls (/auth/me, GET /auth/profile) are fired by several
            // components on every page load and must not share it.
            limit = authPerMinute;
        }

        String key = clientIp(request) + "|" + path;
        if (!allow(key, limit)) {
            response.setStatus(429); // 429 Too Many Requests (not in older servlet constants)
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                    "{\"error\":\"rate_limited\",\"message\":\"Too many requests — please wait a minute and try again.\"}");
            return false;
        }
        return true;
    }

    private boolean allow(String key, int limit) {
        long now = System.currentTimeMillis();
        Window w = windows.compute(key, (k, cur) -> {
            if (cur == null || now - cur.startedAt > WINDOW_MS) {
                return new Window(now, 1);
            }
            cur.count++;
            return cur;
        });
        if (windows.size() > MAX_KEYS) {
            prune(now);
        }
        return w.count <= limit;
    }

    /** Drop stale windows so the map can't grow without bound. */
    private void prune(long now) {
        Iterator<Map.Entry<String, Window>> it = windows.entrySet().iterator();
        while (it.hasNext()) {
            if (now - it.next().getValue().startedAt > 2 * WINDOW_MS) {
                it.remove();
            }
        }
    }

    private static boolean isWrite(HttpServletRequest request) {
        String m = request.getMethod().toUpperCase();
        return "POST".equals(m) || "PUT".equals(m) || "PATCH".equals(m) || "DELETE".equals(m);
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static final class Window {
        final long startedAt;
        int count;

        Window(long startedAt, int count) {
            this.startedAt = startedAt;
            this.count = count;
        }
    }
}
