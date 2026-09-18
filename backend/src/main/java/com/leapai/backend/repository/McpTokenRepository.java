package com.leapai.backend.repository;

import com.leapai.backend.model.McpToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface McpTokenRepository extends JpaRepository<McpToken, Long> {
    Optional<McpToken> findByTokenHash(String tokenHash);
    List<McpToken> findByUserIdOrderByCreatedAtDesc(Long userId);
}
