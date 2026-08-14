package com.leapai.backend.repository;

import com.leapai.backend.model.UserResource;
import com.leapai.backend.model.UserResourceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserResourceRepository extends JpaRepository<UserResource, UserResourceId> {

    @Query("select ur from UserResource ur where ur.id.userId = :userId")
    List<UserResource> findByUserId(@Param("userId") Long userId);

    @Query("select ur from UserResource ur where ur.id.userId = :userId and ur.isBookmarked = true")
    List<UserResource> findByUserIdAndIsBookmarkedTrue(@Param("userId") Long userId);

    @Query("select ur from UserResource ur where ur.id.userId = :userId and ur.isCompleted = true")
    List<UserResource> findByUserIdAndIsCompletedTrue(@Param("userId") Long userId);
}
