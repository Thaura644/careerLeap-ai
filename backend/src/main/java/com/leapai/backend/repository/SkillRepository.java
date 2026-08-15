package com.leapai.backend.repository;

import com.leapai.backend.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findByNormalizedName(String normalizedName);

    /** Prefix + substring search over the normalized name, most-used first. */
    List<Skill> findTop10ByNormalizedNameContainingOrderByUsageCountDesc(String token);

    List<Skill> findTop20ByOrderByUsageCountDesc();

    long countByNormalizedName(String normalizedName);
}
