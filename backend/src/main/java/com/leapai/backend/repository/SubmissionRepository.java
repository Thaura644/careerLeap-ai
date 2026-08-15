package com.leapai.backend.repository;

import com.leapai.backend.model.Problem;
import com.leapai.backend.model.Submission;
import com.leapai.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Submission> findFirstByUserIdAndProblemIdOrderByCreatedAtDesc(Long userId, Long problemId);
    /** True if the user has ever passed every hidden test on this problem. */
    boolean existsByUserIdAndProblemIdAndVerdict(Long userId, Long problemId, String verdict);
    boolean existsByUserIdAndProblemIdAndVerdictAndPassedGreaterThanEqual(Long userId, Long problemId, String verdict, int passed);
}
