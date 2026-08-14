package com.leapai.backend.repository;

import com.leapai.backend.model.CommunityGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityGroupRepository extends JpaRepository<CommunityGroup, Long> {
    List<CommunityGroup> findAllByOrderByIdAsc();
}
