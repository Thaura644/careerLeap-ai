package com.leapai.backend.service;

import com.leapai.backend.config.SkillSeeder;
import com.leapai.backend.model.Skill;
import com.leapai.backend.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** The selectable skills catalog: search, popular, create, usage tracking. */
@Service
public class SkillService {

    private final SkillRepository skills;

    public SkillService(SkillRepository skills) {
        this.skills = skills;
    }

    /** Search the catalog; empty query returns the most-used skills. */
    public List<Map<String, Object>> search(String query, int limit) {
        List<Skill> rows;
        if (query == null || query.trim().isEmpty()) {
            rows = skills.findTop20ByOrderByUsageCountDesc();
        } else {
            rows = skills.findTop10ByNormalizedNameContainingOrderByUsageCountDesc(
                    SkillSeeder.normalize(query.trim()));
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (Skill s : rows) {
            out.add(toView(s));
        }
        return out.subList(0, Math.min(limit, out.size()));
    }

    /** Create a custom skill (or return the existing one). */
    public Map<String, Object> create(String name, String category) {
        String trimmed = name == null ? "" : name.trim();
        String normalized = SkillSeeder.normalize(trimmed);
        if (normalized.isEmpty() || normalized.length() > 80) {
            throw new IllegalArgumentException("Skill name must be between 1 and 80 characters.");
        }
        Skill existing = skills.findByNormalizedName(normalized).orElse(null);
        if (existing != null) return toView(existing);

        Skill s = new Skill();
        s.setName(trimmed);
        s.setNormalizedName(normalized);
        s.setCategory(cleanCategory(category));
        s.setUsageCount(0);
        skills.save(s);
        return toView(s);
    }

    /** Ensure a skill exists in the catalog (used by resume analysis). Returns
     *  the skill and whether it already existed (inCatalog=true). */
    public Map<String, Object> ensure(String name, String category) {
        Skill existing = skills.findByNormalizedName(SkillSeeder.normalize(name)).orElse(null);
        if (existing != null) {
            Map<String, Object> view = toView(existing);
            view.put("inCatalog", true);
            return view;
        }
        Skill s = new Skill();
        s.setName(name.trim());
        s.setNormalizedName(SkillSeeder.normalize(name));
        s.setCategory(cleanCategory(category));
        s.setUsageCount(0);
        skills.save(s);
        Map<String, Object> view = toView(s);
        view.put("inCatalog", false);
        return view;
    }

    /** Bump usage for each skill name saved in a user's profile (popularity signal). */
    public void recordUsage(List<String> names) {
        if (names == null) return;
        for (String name : names) {
            if (name == null || name.isBlank()) continue;
            skills.findByNormalizedName(SkillSeeder.normalize(name)).ifPresent(s -> {
                s.setUsageCount(s.getUsageCount() + 1);
                skills.save(s);
            });
        }
    }

    private static String cleanCategory(String category) {
        String c = category == null || category.isBlank() ? "Other" : category.trim();
        return c.length() > 60 ? c.substring(0, 60) : c;
    }

    private static Map<String, Object> toView(Skill s) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", s.getId());
        view.put("name", s.getName());
        view.put("category", s.getCategory());
        view.put("usageCount", s.getUsageCount());
        return view;
    }
}
