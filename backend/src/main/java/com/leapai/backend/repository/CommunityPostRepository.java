package com.leapai.backend.repository;

import com.leapai.backend.model.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    List<CommunityPost> findTop50ByOrderByCreatedAtDesc();
    List<CommunityPost> findByGroupIdOrderByCreatedAtDesc(Long groupId);
    Optional<CommunityPost> findFirstByGroupIdOrderByCreatedAtDesc(Long groupId);
}
