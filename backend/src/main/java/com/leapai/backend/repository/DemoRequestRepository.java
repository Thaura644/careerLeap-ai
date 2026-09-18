package com.leapai.backend.repository;

import com.leapai.backend.model.DemoRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemoRequestRepository extends JpaRepository<DemoRequest, Long> {
}
