package com.leapai.backend.service;

import com.leapai.backend.model.User;
import com.leapai.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Credit-based rate limiting per tier.
 *
 * <p><b>Free tier:</b> 300 credits/month. Each AI action (chat, roadmap,
 * flashcards, resume analysis, resource enrichment) costs 1 credit. When
 * depleted, the user must wait 7 hours before getting a partial refill of
 * 50 credits. Monthly reset happens on the 1st of each month (UTC).
 *
 * <p><b>Pro tier:</b> unlimited (999,999 credits — effectively no limit).
 *
 * <p>This makes credits drain slowly for normal usage — a free user doing
 * 10 AI chats/day uses ~300/month, right at the limit. The 7-hour cooldown
 * prevents abuse but doesn't punish normal usage patterns.
 */
@Service
public class CreditService {

    private static final Logger log = LoggerFactory.getLogger(CreditService.class);

    /** Free tier monthly allowance. */
    public static final int FREE_MONTHLY = 300;
    /** Pro tier monthly allowance (effectively unlimited). */
    public static final int PRO_MONTHLY = 999_999;
    /** Partial refill when depleted + cooldown expires. */
    public static final int PARTIAL_REFILL = 50;
    /** Cooldown after credits are fully depleted. */
    public static final Duration COOLDOWN = Duration.ofHours(7);

    private final UserRepository users;

    public CreditService(UserRepository users) {
        this.users = users;
    }

    /** Cost of each action type in credits. */
    public enum Action {
        CHAT(1),
        ROADMAP(1),
        FLASHCARDS(1),
        RESUME(1),
        ENRICH(1);

        private final int cost;
        Action(int cost) { this.cost = cost; }
        public int cost() { return cost; }
    }

    /**
     * Check + consume credits for an action. Returns true if the action is
     * allowed, false if credits are exhausted (caller should return 403).
     * The user's credits are updated atomically.
     */
    @Transactional
    public boolean consume(User user, Action action) {
        if (user.getPlan() == User.Plan.PRO) {
            // Pro users have effectively unlimited credits — just track usage.
            return true;
        }

        refreshIfNeeded(user);
        int cost = action.cost();

        if (user.getCreditsRemaining() < cost) {
            log.debug("User {} exhausted credits ({} remaining, need {})",
                    user.getId(), user.getCreditsRemaining(), cost);
            return false;
        }

        user.setCreditsRemaining(user.getCreditsRemaining() - cost);
        users.save(user);
        return true;
    }

    /**
     * Returns the credit status for the billing UI — no mutations.
     */
    public Map<String, Object> status(User user) {
        Map<String, Object> out = new LinkedHashMap<>();
        if (user.getPlan() == User.Plan.PRO) {
            out.put("creditsRemaining", "Unlimited");
            out.put("creditsTotal", "Unlimited");
            out.put("creditsUsed", 0);
            out.put("resetsAt", null);
            out.put("refreshesIn", null);
            out.put("plan", "pro");
            return out;
        }

        refreshIfNeeded(user);
        out.put("plan", "free");
        out.put("creditsTotal", FREE_MONTHLY);
        out.put("creditsRemaining", user.getCreditsRemaining());
        out.put("creditsUsed", FREE_MONTHLY - user.getCreditsRemaining());

        // Monthly reset date (1st of next month, UTC)
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        ZonedDateTime firstOfNextMonth = now.withDayOfMonth(1).plusMonths(1).withHour(0).withMinute(0).withSecond(0);
        out.put("resetsAt", Instant.from(firstOfNextMonth));

        // If depleted, when does the partial refill arrive?
        Instant lastReset = user.getCreditResetAt();
        if (user.getCreditsRemaining() < PARTIAL_REFILL && lastReset != null) {
            Instant refillAt = lastReset.plus(COOLDOWN);
            if (refillAt.isAfter(Instant.now())) {
                out.put("refreshesIn", Duration.between(Instant.now(), refillAt).toSeconds());
            } else {
                out.put("refreshesIn", 0L);
            }
        }

        return out;
    }

    /**
     * Called on every consume/status. Handles:
     * 1. Monthly reset (1st of month) → full 300 credits.
     * 2. If depleted + 7hr cooldown expired → +50 partial refill.
     */
    private void refreshIfNeeded(User user) {
        Instant now = Instant.now();
        Instant lastReset = user.getCreditResetAt();

        // Monthly reset: check if we crossed the 1st of a new month
        LocalDate lastResetDate = lastReset.atZone(ZoneOffset.UTC).toLocalDate();
        LocalDate today = now.atZone(ZoneOffset.UTC).toLocalDate();
        LocalDate firstOfThisMonth = today.withDayOfMonth(1);

        if (lastResetDate.isBefore(firstOfThisMonth)) {
            // New month — full refresh
            user.setCreditsRemaining(FREE_MONTHLY);
            user.setCreditResetAt(now);
            users.save(user);
            log.debug("Monthly credit reset for user {}: {} → {}", user.getId(), FREE_MONTHLY, FREE_MONTHLY);
            return;
        }

        // Partial refill: if credits are low and 7 hours have passed since last refill
        if (user.getCreditsRemaining() < FREE_MONTHLY && lastReset != null) {
            Instant refillAt = lastReset.plus(COOLDOWN);
            if (now.isAfter(refillAt)) {
                int newTotal = Math.min(user.getCreditsRemaining() + PARTIAL_REFILL, FREE_MONTHLY);
                user.setCreditsRemaining(newTotal);
                user.setCreditResetAt(now);
                users.save(user);
                log.debug("Partial credit refill for user {}: {} → {}", user.getId(), newTotal - PARTIAL_REFILL, newTotal);
            }
        }
    }
}
