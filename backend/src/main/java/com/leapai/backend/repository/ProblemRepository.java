package com.leapai.backend.repository;

import com.leapai.backend.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findBySlug(String slug);
    List<Problem> findAllByOrderByDifficultyAscIdAsc();
}
