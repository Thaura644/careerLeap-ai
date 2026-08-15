package com.leapai.backend.repository;

import com.leapai.backend.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {

    List<Flashcard> findByUserIdOrderByCreatedAtAsc(Long userId);

    /** Cards due for review, oldest due first. */
    List<Flashcard> findByUserIdAndDueAtLessThanEqualOrderByDueAtAsc(Long userId, Instant now);

    long countByUserId(Long userId);

    long countByUserIdAndDueAtLessThanEqual(Long userId, Instant now);

    long countByUserIdAndBoxGreaterThanEqual(Long userId, int box);

    void deleteByUserId(Long userId);
}
