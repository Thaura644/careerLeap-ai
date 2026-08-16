package com.leapai.backend.repository;

import com.leapai.backend.model.TokenUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface TokenUsageRepository extends JpaRepository<TokenUsage, Long> {
    List<TokenUsage> findByUserIdAndCreatedAtAfter(Long userId, Instant after);
    long countByUserId(Long userId);
}
