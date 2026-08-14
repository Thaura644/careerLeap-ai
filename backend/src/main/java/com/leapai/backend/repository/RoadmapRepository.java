package com.leapai.backend.repository;

import com.leapai.backend.model.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    Optional<Roadmap> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    List<Roadmap> findByUserIdOrderByCreatedAtDesc(Long userId);
}
