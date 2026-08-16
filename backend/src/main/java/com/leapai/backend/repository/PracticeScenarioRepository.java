package com.leapai.backend.repository;

import com.leapai.backend.model.PracticeScenario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PracticeScenarioRepository extends JpaRepository<PracticeScenario, Long> {

    Optional<PracticeScenario> findBySlug(String slug);

    List<PracticeScenario> findAllByOrderByIdAsc();
}
