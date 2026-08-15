package com.leapai.backend.controller;

import com.leapai.backend.service.SkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    /** Search the catalog. No query -> most-used skills. */
    @GetMapping
    public List<Map<String, Object>> search(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        return skillService.search(query, limit);
    }

    /** Create a custom skill (idempotent — returns existing if already present). */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        String name = String.valueOf(body.getOrDefault("name", ""));
        String category = String.valueOf(body.getOrDefault("category", "Other"));
        try {
            Map<String, Object> skill = skillService.create(name, category);
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("ok", true);
            res.put("skill", skill);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", e.getMessage()));
        }
    }
}
