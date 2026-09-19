package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.CommunityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping
    public List<Map<String, Object>> getCommunityGroups() {
        return communityService.groups(UserContext.require());
    }

    @PostMapping("/{groupId}/join")
    public Map<String, Object> join(@PathVariable Long groupId) {
        return communityService.join(groupId, UserContext.require());
    }

    @PostMapping("/{groupId}/leave")
    public Map<String, Object> leave(@PathVariable Long groupId) {
        return communityService.leave(groupId, UserContext.require());
    }

    @GetMapping("/posts")
    public Map<String, Object> recentPosts() {
        return Map.of("posts", communityService.recentPosts());
    }

    @PostMapping("/{groupId}/posts")
    public Map<String, Object> createPost(@PathVariable Long groupId, @RequestBody Map<String, Object> body) {
        String text = body.get("body") == null ? "" : String.valueOf(body.get("body"));
        return communityService.createPost(groupId, UserContext.require(), text);
    }
}
