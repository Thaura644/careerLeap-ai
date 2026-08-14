package com.leapai.backend.repository;

import com.leapai.backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCategoryOrderByIdAsc(String category);
}
