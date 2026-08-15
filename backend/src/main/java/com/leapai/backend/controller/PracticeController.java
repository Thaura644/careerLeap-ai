package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.PracticeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {

    private final PracticeService practiceService;

    public PracticeController(PracticeService practiceService) {
        this.practiceService = practiceService;
    }

    /** All problems with per-user solved state (auth required). */
    @GetMapping("/problems")
    public Map<String, Object> list() {
        return Map.of("problems", practiceService.list(UserContext.require()));
    }

    /** Problem detail for the editor — includes sample cases, never the hidden tests. */
    @GetMapping("/problems/{slug}")
    public Map<String, Object> detail(@PathVariable String slug) {
        return practiceService.detail(slug, UserContext.require());
    }

    /** Run user code against the visible sample cases (not persisted). */
    @PostMapping("/problems/{slug}/run")
    public Map<String, Object> run(@PathVariable String slug, @RequestBody Map<String, Object> body) {
        return practiceService.run(slug, String.valueOf(body.getOrDefault("code", "")));
    }

    /** Submit against the hidden tests; verdict is persisted. */
    @PostMapping("/problems/{slug}/submit")
    public Map<String, Object> submit(@PathVariable String slug, @RequestBody Map<String, Object> body) {
        return practiceService.submit(slug, String.valueOf(body.getOrDefault("code", "")), UserContext.require());
    }

    /** Solved counts + recent submissions for the dashboard. */
    @GetMapping("/progress")
    public Map<String, Object> progress() {
        return practiceService.progress(UserContext.require());
    }
}
