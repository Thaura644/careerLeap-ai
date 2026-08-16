package com.leapai.backend.repository;

import com.leapai.backend.model.ScenarioProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ScenarioProgressRepository extends JpaRepository<ScenarioProgress, Long> {

    Optional<ScenarioProgress> findByUserIdAndScenarioSlug(Long userId, String scenarioSlug);
}
