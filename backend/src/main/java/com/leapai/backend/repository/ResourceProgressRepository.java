package com.leapai.backend.repository;

import com.leapai.backend.model.ResourceProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceProgressRepository extends JpaRepository<ResourceProgress, Long> {

    List<ResourceProgress> findByUserId(Long userId);

    Optional<ResourceProgress> findByUserIdAndResourceUrl(Long userId, String resourceUrl);
}
