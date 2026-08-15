package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.FlashcardService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    /** The full deck + scheduling stats. */
    @GetMapping
    public Map<String, Object> deck() {
        return flashcardService.deck(UserContext.require());
    }

    /** Cards due right now. */
    @GetMapping("/due")
    public Map<String, Object> due() {
        return Map.of("cards", flashcardService.due(UserContext.require()));
    }

    /** Generate a fresh deck from the user's roadmap and skills. */
    @PostMapping("/generate")
    public Map<String, Object> generate() {
        return flashcardService.generate(UserContext.require());
    }

    /** Rate a card: rating 0=again, 1=hard, 2=good, 3=easy. */
    @PostMapping("/{id}/review")
    public Map<String, Object> review(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Object rating = body.getOrDefault("rating", 2);
        return flashcardService.review(UserContext.require(), id, ((Number) rating).intValue());
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        flashcardService.delete(UserContext.require(), id);
        return Map.of("deleted", true);
    }
}
