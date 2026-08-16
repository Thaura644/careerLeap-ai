package com.leapai.backend.repository;

import com.leapai.backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCategoryOrderByIdAsc(String category);
    Optional<Resource> findByUrl(String url);
    List<Resource> findBySourceOrderByIdDesc(String source);
    List<Resource> findByCreatedByIdOrderByIdDesc(Long createdById);
}
