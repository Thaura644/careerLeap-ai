package com.leapai.backend.repository;

import com.leapai.backend.model.CommunityMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityMembershipRepository extends JpaRepository<CommunityMembership, Long> {
    Optional<CommunityMembership> findByUserIdAndGroupId(Long userId, Long groupId);
    List<CommunityMembership> findByUserId(Long userId);
    long countByGroupId(Long groupId);
    Optional<CommunityMembership> findFirstByGroupIdOrderByJoinedAtDesc(Long groupId);
}
