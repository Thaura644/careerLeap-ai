package com.leapai.backend.service;

import com.leapai.backend.config.ForbiddenException;
import com.leapai.backend.model.CommunityGroup;
import com.leapai.backend.model.CommunityMembership;
import com.leapai.backend.model.CommunityPost;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.CommunityGroupRepository;
import com.leapai.backend.repository.CommunityMembershipRepository;
import com.leapai.backend.repository.CommunityPostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Community groups, memberships, and posts. Group topics/seed member counts
 * are curated content; joining, leaving, and posting are real, persisted
 * actions — not a static listing. The displayed member count is the seed
 * count plus real joins, so it grows as people actually join.
 */
@Service
public class CommunityService {

    private final CommunityGroupRepository groups;
    private final CommunityMembershipRepository memberships;
    private final CommunityPostRepository posts;

    public CommunityService(CommunityGroupRepository groups, CommunityMembershipRepository memberships,
                             CommunityPostRepository posts) {
        this.groups = groups;
        this.memberships = memberships;
        this.posts = posts;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> groups(User user) {
        Set<Long> joinedIds = memberships.findByUserId(user.getId()).stream()
                .map(CommunityMembership::getGroupId)
                .collect(Collectors.toSet());
        List<Map<String, Object>> result = new ArrayList<>();
        for (CommunityGroup g : groups.findAllByOrderByIdAsc()) {
            result.add(groupDto(g, joinedIds.contains(g.getId())));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> join(Long groupId, User user) {
        CommunityGroup g = requireGroup(groupId);
        if (memberships.findByUserIdAndGroupId(user.getId(), groupId).isEmpty()) {
            CommunityMembership m = new CommunityMembership();
            m.setUserId(user.getId());
            m.setGroupId(groupId);
            memberships.save(m);
        }
        return groupDto(g, true);
    }

    @Transactional
    public Map<String, Object> leave(Long groupId, User user) {
        CommunityGroup g = requireGroup(groupId);
        memberships.findByUserIdAndGroupId(user.getId(), groupId).ifPresent(memberships::delete);
        return groupDto(g, false);
    }

    /** Recent posts across all groups — a town-square feed. Reading needs no membership. */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> recentPosts() {
        Map<Long, String> topicById = new LinkedHashMap<>();
        for (CommunityGroup g : groups.findAllByOrderByIdAsc()) topicById.put(g.getId(), g.getTopic());

        List<Map<String, Object>> out = new ArrayList<>();
        for (CommunityPost p : posts.findTop50ByOrderByCreatedAtDesc()) {
            out.add(postDto(p, topicById.get(p.getGroupId())));
        }
        return out;
    }

    /** Posting requires membership — you join the conversation, then you post in it. */
    @Transactional
    public Map<String, Object> createPost(Long groupId, User user, String body) {
        requireGroup(groupId);
        if (memberships.findByUserIdAndGroupId(user.getId(), groupId).isEmpty()) {
            throw new ForbiddenException("Join this group before posting in it.");
        }
        String trimmed = body == null ? "" : body.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Post can't be empty.");
        }
        if (trimmed.length() > 4000) {
            trimmed = trimmed.substring(0, 4000);
        }
        CommunityPost p = new CommunityPost();
        p.setGroupId(groupId);
        p.setUserId(user.getId());
        p.setAuthorName(user.getFullName() == null || user.getFullName().isBlank() ? "Member" : user.getFullName());
        p.setBody(trimmed);
        posts.save(p);

        CommunityGroup g = requireGroup(groupId);
        return postDto(p, g.getTopic());
    }

    private CommunityGroup requireGroup(Long groupId) {
        return groups.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found: " + groupId));
    }

    private Map<String, Object> groupDto(CommunityGroup g, boolean joined) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", g.getId());
        dto.put("topic", g.getTopic());
        dto.put("members", g.getMembers() + memberships.countByGroupId(g.getId()));
        dto.put("lastActive", g.getLastActive());
        dto.put("joined", joined);
        return dto;
    }

    private Map<String, Object> postDto(CommunityPost p, String groupTopic) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", p.getId());
        dto.put("groupId", p.getGroupId());
        dto.put("groupTopic", groupTopic);
        dto.put("authorName", p.getAuthorName());
        dto.put("body", p.getBody());
        dto.put("createdAt", p.getCreatedAt());
        return dto;
    }
}
