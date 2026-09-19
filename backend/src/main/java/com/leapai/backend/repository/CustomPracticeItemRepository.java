package com.leapai.backend.repository;

import com.leapai.backend.model.CustomPracticeItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomPracticeItemRepository extends JpaRepository<CustomPracticeItem, Long> {
    List<CustomPracticeItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<CustomPracticeItem> findByIdAndUserId(Long id, Long userId);
}
