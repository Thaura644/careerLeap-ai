package com.leapai.backend.repository;

import com.leapai.backend.model.CustomPracticeSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomPracticeSubmissionRepository extends JpaRepository<CustomPracticeSubmission, Long> {
    List<CustomPracticeSubmission> findByItemIdOrderByCreatedAtDesc(Long itemId);
    Optional<CustomPracticeSubmission> findFirstByItemIdOrderByCreatedAtDesc(Long itemId);
}
