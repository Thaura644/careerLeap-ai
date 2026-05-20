package com.leapai.backend.controller;

import com.leapai.backend.model.LoginRequest;
import com.leapai.backend.model.SignupRequest;
import com.leapai.backend.service.MockDataService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final MockDataService mockDataService;

    public AuthController(MockDataService mockDataService) {
        this.mockDataService = mockDataService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        return mockDataService.login(request.getEmail());
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@Valid @RequestBody SignupRequest request) {
        return mockDataService.signup(request.getFullName(), request.getEmail());
    }
}
