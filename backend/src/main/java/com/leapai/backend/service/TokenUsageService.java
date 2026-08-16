package com.leapai.backend.service;

import com.leapai.backend.model.TokenUsage;
import com.leapai.backend.repository.TokenUsageRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Per-user LLM usage summary — the "where did my allowance go" breakdown for
 * Settings. Counts only real LLM calls (the deterministic engine fallbacks
 * cost nothing and are never recorded). With the free-model guard in
 * {@link LlmService} the honest cost is $0; if a paid model were ever used
 * this is where a per-token estimate would be surfaced.
 */
@Service
public class TokenUsageService {

    private final TokenUsageRepository usage;

    public TokenUsageService(TokenUsageRepository usage) {
        this.usage = usage;
    }

    /** Usage for the trailing 30 days, plus an honest cost estimate. */
    public Map<String, Object> summary(Long userId) {
        List<TokenUsage> rows = usage.findByUserIdAndCreatedAtAfter(
                userId, Instant.now().minusSeconds(30L * 24 * 60 * 60));

        long prompt = 0, completion = 0, total = 0;
        String model = "";
        for (TokenUsage t : rows) {
            prompt += t.getPromptTokens();
            completion += t.getCompletionTokens();
            total += t.getTotalTokens();
            model = t.getModel();
        }

        boolean freeModel = model != null && model.endsWith(":free");

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("monthPromptTokens", prompt);
        out.put("monthCompletionTokens", completion);
        out.put("monthTotalTokens", total);
        out.put("monthRequests", rows.size());
        out.put("model", model);
        out.put("freeModel", freeModel);
        // Free models only today — the honest number is zero. If a paid model
        // is ever configured, this becomes a real per-token estimate.
        out.put("estimatedCostUsd", 0.0);
        out.put("note", freeModel
                ? "Powered by a free model — your usage costs nothing today."
                : "Usage is recorded per request; a per-token cost estimate will appear here when paid models are configured.");
        return out;
    }
}
