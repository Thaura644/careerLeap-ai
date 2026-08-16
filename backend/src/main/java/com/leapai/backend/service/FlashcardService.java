package com.leapai.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leapai.backend.model.Flashcard;
import com.leapai.backend.model.Roadmap;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.FlashcardRepository;
import com.leapai.backend.repository.RoadmapRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Spaced-repetition flashcards generated from the user's real roadmap and
 * skills. Scheduling is an SM-2-inspired algorithm: each card has a Leitner
 * box, an interval in days, and an Anki-style ease factor. Ratings
 * (again/hard/good/easy) reschedule the card — "again" drops it back to box 1
 * and shortens the interval, "easy" jumps it ahead.
 */
@Service
public class FlashcardService {

    private static final Logger log = LoggerFactory.getLogger(FlashcardService.class);

    private static final double[] BOX_INTERVALS = {1.0, 3.0, 7.0, 14.0, 30.0};
    private static final double MIN_EASE = 1.3;
    private static final double MAX_EASE = 3.0;

    private final FlashcardRepository flashcards;
    private final RoadmapRepository roadmaps;
    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    public FlashcardService(FlashcardRepository flashcards, RoadmapRepository roadmaps,
                            LlmService llmService, ObjectMapper objectMapper) {
        this.flashcards = flashcards;
        this.roadmaps = roadmaps;
        this.llmService = llmService;
        this.objectMapper = objectMapper;
    }

    /** All cards + scheduling stats for the user. */
    @Transactional(readOnly = true)
    public Map<String, Object> deck(User user) {
        List<Map<String, Object>> cards = new ArrayList<>();
        for (Flashcard c : flashcards.findByUserIdOrderByCreatedAtAsc(user.getId())) {
            cards.add(view(c, user));
        }
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", flashcards.countByUserId(user.getId()));
        stats.put("due", flashcards.countByUserIdAndDueAtLessThanEqual(user.getId(), Instant.now()));
        stats.put("learned", flashcards.countByUserIdAndBoxGreaterThanEqual(user.getId(), 3));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("cards", cards);
        result.put("stats", stats);
        return result;
    }

    /** Cards due for review right now. */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> due(User user) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Flashcard c : flashcards.findByUserIdAndDueAtLessThanEqualOrderByDueAtAsc(user.getId(), Instant.now())) {
            out.add(view(c, user));
        }
        return out;
    }

    /**
     * Generate a fresh deck from the user's real roadmap and assessed skills.
     * Uses the LLM when configured; otherwise a deterministic engine that
     * turns the roadmap's own milestones/skills into Q/A cards — real content,
     * never invented facts.
     */
    @Transactional
    public Map<String, Object> generate(User user) {
        flashcards.deleteByUserId(user.getId());

        List<Map<String, Object>> cards = llmService.generateFlashcards(
                roadmapSnapshot(user), skillsOf(user), user.getTargetRole(), user.getId());

        if (cards == null || cards.isEmpty()) {
            cards = engineCards(user);
        }
        int saved = 0;
        for (Map<String, Object> card : cards) {
            String front = String.valueOf(card.getOrDefault("front", "")).trim();
            String back = String.valueOf(card.getOrDefault("back", "")).trim();
            if (front.isEmpty() || back.isEmpty()) continue;
            Flashcard c = new Flashcard();
            c.setUserId(user.getId());
            c.setFront(truncate(front, 500));
            c.setBack(truncate(back, 3000));
            c.setTopic(truncate(String.valueOf(card.getOrDefault("topic", "General")), 120));
            c.setDueAt(Instant.now());
            flashcards.save(c);
            saved++;
        }
        log.info("[flashcards] generated {} cards for {}", saved, user.getEmail());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("generated", saved);
        result.put("source", cards.isEmpty() ? "engine" : "llm");
        return result;
    }

    /**
     * Rate a card and reschedule it. Rating: again (0) / hard (1) / good (2) / easy (3).
     */
    @Transactional
    public Map<String, Object> review(User user, Long cardId, int rating) {
        Flashcard c = flashcards.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Flashcard not found"));
        if (!c.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("Flashcard not found");
        }
        if (rating < 0 || rating > 3) {
            throw new IllegalArgumentException("Rating must be 0 (again), 1 (hard), 2 (good), or 3 (easy).");
        }

        if (rating == 0) {
            // Failed: back to box 1, short interval, ease drops.
            c.setBox(1);
            c.setIntervalDays(BOX_INTERVALS[0]);
            c.setLapses(c.getLapses() + 1);
            c.setEaseFactor(Math.max(MIN_EASE, c.getEaseFactor() - 0.2));
        } else if (rating == 1) {
            // Hard: keep the box, ~1.2x the current interval.
            c.setBox(Math.max(1, c.getBox() - 1));
            c.setIntervalDays(Math.max(1.0, c.getIntervalDays() * 1.2));
            c.setEaseFactor(Math.max(MIN_EASE, c.getEaseFactor() - 0.15));
        } else if (rating == 2) {
            // Good: advance one box, interval from the box table.
            c.setBox(Math.min(5, c.getBox() + 1));
            c.setIntervalDays(BOX_INTERVALS[c.getBox() - 1]);
        } else {
            // Easy: jump two boxes, longer interval, ease rises.
            c.setBox(Math.min(5, c.getBox() + 2));
            c.setIntervalDays(BOX_INTERVALS[c.getBox() - 1] * 1.5);
            c.setEaseFactor(Math.min(MAX_EASE, c.getEaseFactor() + 0.15));
        }

        c.setReviewCount(c.getReviewCount() + 1);
        c.setDueAt(Instant.now().plus((long) (c.getIntervalDays() * 24 * 3600), ChronoUnit.SECONDS));
        c.setUpdatedAt(Instant.now());
        flashcards.save(c);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("card", view(c, user));
        result.put("dueLeft", flashcards.countByUserIdAndDueAtLessThanEqual(user.getId(), Instant.now()));
        return result;
    }

    /** Delete one of the user's cards. */
    @Transactional
    public void delete(User user, Long cardId) {
        Flashcard c = flashcards.findById(cardId).orElseThrow(() -> new IllegalArgumentException("Flashcard not found"));
        if (!c.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("Flashcard not found");
        }
        flashcards.delete(c);
    }

    private Map<String, Object> view(Flashcard c, User user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("front", c.getFront());
        m.put("back", c.getBack());
        m.put("topic", c.getTopic());
        m.put("box", c.getBox());
        m.put("intervalDays", Math.round(c.getIntervalDays() * 10.0) / 10.0);
        m.put("easeFactor", Math.round(c.getEaseFactor() * 100.0) / 100.0);
        m.put("dueAt", c.getDueAt().toString());
        m.put("due", !c.getDueAt().isAfter(Instant.now()));
        m.put("reviewCount", c.getReviewCount());
        m.put("lapses", c.getLapses());
        return m;
    }

    /** Latest roadmap as a compact map the LLM can turn into questions. */
    private Map<String, Object> roadmapSnapshot(User user) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        Roadmap r = roadmaps.findFirstByUserIdOrderByCreatedAtDesc(user.getId()).orElse(null);
        if (r == null) return snapshot;
        snapshot.put("currentRole", r.getCurrentRole());
        snapshot.put("targetRole", r.getTargetRole());
        snapshot.put("timeframe", r.getTimeframe());
        try {
            Map<String, Object> content = objectMapper.readValue(r.getContent(),
                    new TypeReference<Map<String, Object>>() {});
            Object phases = content.get("phases");
            if (phases instanceof List) {
                List<Map<String, Object>> phaseViews = new ArrayList<>();
                for (Object phaseObj : (List<?>) phases) {
                    if (!(phaseObj instanceof Map)) continue;
                    @SuppressWarnings("unchecked")
                    Map<String, Object> phase = (Map<String, Object>) phaseObj;
                    Map<String, Object> pv = new LinkedHashMap<>();
                    pv.put("title", phase.get("title"));
                    pv.put("focus", phase.get("focus"));
                    pv.put("skills", phase.get("skills"));
                    pv.put("milestones", phase.get("milestones"));
                    phaseViews.add(pv);
                }
                snapshot.put("phases", phaseViews);
            }
        } catch (Exception ignored) {
            // Roadmap content may be absent — the engine fallback handles it.
        }
        return snapshot;
    }

    private List<String> skillsOf(User user) {
        List<String> out = new ArrayList<>();
        if (user.getInterests() != null) {
            for (String s : user.getInterests().split(",")) {
                String trimmed = s.trim();
                if (!trimmed.isEmpty()) out.add(trimmed);
            }
        }
        return out;
    }

    /** Deterministic fallback: Q/A cards built from the roadmap's own content. */
    private List<Map<String, Object>> engineCards(User user) {
        List<Map<String, Object>> cards = new ArrayList<>();
        Map<String, Object> snapshot = roadmapSnapshot(user);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> phases = (List<Map<String, Object>>) snapshot.get("phases");
        if (phases != null) {
            for (Map<String, Object> phase : phases) {
                String title = String.valueOf(phase.getOrDefault("title", "Phase"));
                Object milestones = phase.get("milestones");
                if (milestones instanceof List) {
                    for (Object m : (List<?>) milestones) {
                        if (String.valueOf(m).isBlank()) continue;
                        Map<String, Object> card = new LinkedHashMap<>();
                        card.put("front", "Milestone: " + m);
                        card.put("back", "Part of " + title
                                + (phase.get("focus") == null ? "" : " — focus: " + phase.get("focus"))
                                + ". Check it off when you have real evidence for it.");
                        card.put("topic", title);
                        cards.add(card);
                    }
                }
            }
        }

        for (String skill : skillsOf(user)) {
            Map<String, Object> card = new LinkedHashMap<>();
            card.put("front", "Explain " + skill + " in your own words");
            card.put("back", "You rated this as a skill you're building toward "
                    + nvl(user.getTargetRole(), "your target role")
                    + ". Answer from your own experience; revisit your roadmap's resources if you can't yet.");
            card.put("topic", "Skill: " + skill);
            cards.add(card);
        }

        if (cards.isEmpty()) {
            Map<String, Object> card = new LinkedHashMap<>();
            card.put("front", "What is your target role?");
            card.put("back", nvl(user.getTargetRole(), "Set a target role in Settings — every card here is generated from your real roadmap and skills."));
            card.put("topic", "Career plan");
            cards.add(card);
        }
        return cards;
    }

    private static String truncate(String value, int max) {
        return value == null ? "" : value.length() <= max ? value : value.substring(0, max);
    }

    private static String nvl(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
