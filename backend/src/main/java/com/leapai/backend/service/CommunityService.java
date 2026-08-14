package com.leapai.backend.service;

import com.leapai.backend.model.CommunityGroup;
import com.leapai.backend.repository.CommunityGroupRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Community groups, read from the database (seeded, real member counts). */
@Service
public class CommunityService {

    private final CommunityGroupRepository groups;

    public CommunityService(CommunityGroupRepository groups) {
        this.groups = groups;
    }

    public List<Map<String, Object>> groups() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (CommunityGroup g : groups.findAllByOrderByIdAsc()) {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", g.getId());
            dto.put("topic", g.getTopic());
            dto.put("members", g.getMembers());
            dto.put("lastActive", g.getLastActive());
            result.add(dto);
        }
        return result;
    }
}
