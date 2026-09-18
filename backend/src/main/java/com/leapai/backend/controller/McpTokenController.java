package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.McpTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lets a signed-in user manage the personal access tokens that connect their
 * account to MCP clients (Claude, ChatGPT, etc. — see McpServerController).
 * Session-JWT protected, unlike the MCP endpoint itself.
 */
@RestController
@RequestMapping("/api/mcp/tokens")
public class McpTokenController {

    private final McpTokenService tokenService;

    public McpTokenController(McpTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @GetMapping
    public Map<String, Object> list() {
        return Map.of("tokens", tokenService.list(UserContext.require()));
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        String label = body.get("label") == null ? "" : String.valueOf(body.get("label"));
        return tokenService.create(UserContext.require(), label);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> revoke(@PathVariable Long id) {
        boolean removed = tokenService.revoke(UserContext.require(), id);
        if (!removed) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
