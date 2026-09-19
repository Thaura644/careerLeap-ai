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

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Community groups, memberships, and posts. Every number shown to the user —
 * member count, "last active" — is computed from real CommunityMembership
 * and CommunityPost rows, never a static seed value. A brand-new group
 * honestly shows 0 members and "No activity yet" until real people join and
 * post in it.
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

    /** Real, user-created group — anyone signed in can start one. */
    @Transactional
    public Map<String, Object> createGroup(User user, String topic, String description) {
        String trimmedTopic = topic == null ? "" : topic.trim();
        if (trimmedTopic.isEmpty()) {
            throw new IllegalArgumentException("Give the group a name.");
        }
        if (trimmedTopic.length() > 200) trimmedTopic = trimmedTopic.substring(0, 200);
        String trimmedDesc = description == null ? "" : description.trim();
        if (trimmedDesc.length() > 500) trimmedDesc = trimmedDesc.substring(0, 500);

        CommunityGroup g = new CommunityGroup();
        g.setTopic(trimmedTopic);
        g.setDescription(trimmedDesc.isEmpty() ? null : trimmedDesc);
        g.setCreatedByUserId(user.getId());
        g.setMembers(0);
        g.setLastActive("");
        groups.save(g);

        // Creating a group makes you its first real member.
        CommunityMembership m = new CommunityMembership();
        m.setUserId(user.getId());
        m.setGroupId(g.getId());
        memberships.save(m);

        return groupDto(g, true);
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
        dto.put("description", g.getDescription());
        dto.put("userCreated", g.getCreatedByUserId() != null);
        dto.put("members", memberships.countByGroupId(g.getId()));
        dto.put("lastActive", lastActiveLabel(g.getId()));
        dto.put("joined", joined);
        return dto;
    }

    /** Real "last active" from the most recent post or join in this group — never a canned string. */
    private String lastActiveLabel(Long groupId) {
        Instant latestPost = posts.findFirstByGroupIdOrderByCreatedAtDesc(groupId)
                .map(CommunityPost::getCreatedAt).orElse(null);
        Instant latestJoin = memberships.findFirstByGroupIdOrderByJoinedAtDesc(groupId)
                .map(CommunityMembership::getJoinedAt).orElse(null);
        Instant latest = latestPost == null ? latestJoin
                : latestJoin == null ? latestPost
                : latestPost.isAfter(latestJoin) ? latestPost : latestJoin;
        if (latest == null) return "No activity yet";
        return relativeTime(latest);
    }

    private static String relativeTime(Instant when) {
        Duration d = Duration.between(when, Instant.now());
        long minutes = Math.max(0, d.toMinutes());
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = d.toHours();
        if (hours < 24) return hours + "h ago";
        long days = d.toDays();
        if (days < 30) return days + "d ago";
        return (days / 30) + "mo ago";
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
