package com.leapai.backend.service;

import com.leapai.backend.model.Conversation;
import com.leapai.backend.model.Message;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.ConversationRepository;
import com.leapai.backend.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Persisted AI chat threads — conversations and messages survive restarts. */
@Service
public class ConversationService {

    private final ConversationRepository conversations;
    private final MessageRepository messages;

    public ConversationService(ConversationRepository conversations, MessageRepository messages) {
        this.conversations = conversations;
        this.messages = messages;
    }

    public List<Map<String, Object>> list(User user) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Conversation c : conversations.findByUserIdOrderByUpdatedAtDesc(user.getId())) {
            result.add(conversationDto(c));
        }
        return result;
    }

    public Map<String, Object> get(User user, Long conversationId) {
        Conversation c = conversations.findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        Map<String, Object> dto = conversationDto(c);
        dto.put("messages", messageDtos(messages.findByConversationIdOrderByTimestampAsc(conversationId)));
        return dto;
    }

    @Transactional
    public Map<String, Object> create(User user, String title) {
        Conversation c = new Conversation();
        c.setUserId(user.getId());
        c.setTitle(title == null || title.isBlank() ? "New conversation" : title.trim());
        conversations.save(c);
        return conversationDto(c);
    }

    @Transactional
    public void append(User user, Long conversationId, String role, String content) {
        Conversation c = conversations.findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        Message m = new Message();
        m.setConversationId(conversationId);
        m.setRole(role);
        m.setContent(content);
        m.setTimestamp(Instant.now());
        messages.save(m);
        c.setUpdatedAt(Instant.now());
        if (c.getTitle().equals("New conversation") && "user".equals(role)) {
            c.setTitle(truncate(content, 60));
        }
        conversations.save(c);
    }

    private Map<String, Object> conversationDto(Conversation c) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", c.getId());
        dto.put("title", c.getTitle());
        dto.put("createdAt", c.getCreatedAt().toString());
        dto.put("updatedAt", c.getUpdatedAt().toString());
        return dto;
    }

    private List<Map<String, Object>> messageDtos(List<Message> list) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Message m : list) {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", String.valueOf(m.getId()));
            dto.put("role", m.getRole());
            dto.put("content", m.getContent());
            dto.put("timestamp", m.getTimestamp().toString());
            result.add(dto);
        }
        return result;
    }

    private static String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max).trim() + "…";
    }
}
