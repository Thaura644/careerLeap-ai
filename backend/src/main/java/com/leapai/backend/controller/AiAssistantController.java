package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.AiContextService;
import com.leapai.backend.service.ConversationService;
import com.leapai.backend.service.LlmService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final LlmService llmService;
    private final ConversationService conversationService;
    private final AiContextService aiContextService;

    public AiAssistantController(LlmService llmService, ConversationService conversationService,
                                 AiContextService aiContextService) {
        this.llmService = llmService;
        this.conversationService = conversationService;
        this.aiContextService = aiContextService;
    }

    /**
     * What the AI can see about the user: profile, roadmap, goals, and
     * progress. Lets the frontend show the assistant's grounding honestly
     * (and lets the assistant answer from real data).
     */
    @GetMapping("/context")
    public Map<String, Object> context() {
        return aiContextService.context(UserContext.require().getId());
    }

    /**
     * Chat with the Leap.ai career coach. Conversations are persisted; each
     * exchange (user + assistant) is stored so history survives restarts.
     * Responses carry {@code source}: {@code llm} or {@code engine}.
     */
    @PostMapping("/chat")
    public Map<String, Object> chat(@RequestBody Map<String, Object> body) {
        var user = UserContext.require();
        String prompt = String.valueOf(body.getOrDefault("prompt", ""));
        Object historyObj = body.getOrDefault("history", List.of());

        Map<String, Object> result = new LinkedHashMap<>(llmService.chat(prompt, asHistory(historyObj), user.getId()));

        Object conversationIdObj = body.get("conversationId");
        Long conversationId;
        if (conversationIdObj instanceof Number) {
            conversationId = ((Number) conversationIdObj).longValue();
        } else {
            conversationId = Long.valueOf(String.valueOf(conversationIdObj));
        }
        conversationService.append(user, conversationId, "user", prompt);
        conversationService.append(user, conversationId, "assistant", String.valueOf(result.get("response")));
        result.put("conversationId", conversationId);
        return result;
    }

    /** Create a new (empty) conversation thread. */
    @PostMapping("/conversations")
    public Map<String, Object> createConversation(@RequestBody(required = false) Map<String, Object> body) {
        String title = body == null ? null : String.valueOf(body.getOrDefault("title", "New conversation"));
        return conversationService.create(UserContext.require(), title);
    }

    /** List the user's conversations, newest first. */
    @GetMapping("/conversations")
    public List<Map<String, Object>> listConversations() {
        return conversationService.list(UserContext.require());
    }

    /** One conversation with its full message history. */
    @GetMapping("/conversations/{id}")
    public Map<String, Object> getConversation(@PathVariable("id") Long id) {
        return conversationService.get(UserContext.require(), id);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, String>> asHistory(Object obj) {
        if (obj instanceof List) {
            return (List<Map<String, String>>) obj;
        }
        return List.of();
    }
}
