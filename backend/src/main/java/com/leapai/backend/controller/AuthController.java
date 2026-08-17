package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.model.LoginRequest;
import com.leapai.backend.model.SignupRequest;
import com.leapai.backend.model.User;
import com.leapai.backend.repository.UserRepository;
import com.leapai.backend.service.AuthService;
import com.leapai.backend.service.SkillService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository users;
    private final SkillService skillService;

    public AuthController(AuthService authService, UserRepository users, SkillService skillService) {
        this.authService = authService;
        this.users = users;
        this.skillService = skillService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request.getFullName(), request.getEmail(), request.getPassword());
    }

    /** Start a password reset — public, no auth. Returns the same response for
     *  unknown emails too (no account enumeration). */
    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, Object> body) {
        String email = body.get("email") == null ? "" : String.valueOf(body.get("email")).trim();
        if (email.isEmpty() || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$")) {
            throw new IllegalArgumentException("Enter a valid email address");
        }
        return authService.forgotPassword(email);
    }

    /** Complete a password reset with the one-time token from the email. */
    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, Object> body) {
        String token = body.get("token") == null ? "" : String.valueOf(body.get("token"));
        String password = body.get("password") == null ? "" : String.valueOf(body.get("password"));
        return authService.resetPassword(token, password);
    }

    /** Current user (auth required via interceptor). */
    @GetMapping("/me")
    public Map<String, Object> me() {
        return authService.me(UserContext.require());
    }

    /** Save the career profile collected during onboarding (drives the roadmap engine). */
    @PutMapping("/profile")
    public Map<String, Object> updateProfile(@RequestBody Map<String, Object> profile) {
        User user = UserContext.require();
        user.setCurrentRole(str(profile.get("currentRole"), user.getCurrentRole()));
        user.setTargetRole(str(profile.get("targetRole"), user.getTargetRole()));
        user.setYearsExperience(str(profile.get("yearsExperience"), user.getYearsExperience()));
        user.setIndustry(str(profile.get("industry"), user.getIndustry()));
        user.setLocation(str(profile.get("location"), user.getLocation()));
        user.setTimeframe(str(profile.get("timeframe"), user.getTimeframe()));
        user.setAspirations(str(profile.get("aspirations"), user.getAspirations()));
        // Skills the user self-assessed (comma-separated) drive roadmap focus.
        String interests = str(profile.get("interests"), user.getInterests());
        user.setInterests(interests);
        // Learning preferences (formats, weekly commitment, style) shape the
        // roadmap's pace and the resources surfaced to the user.
        user.setLearningFormats(str(profile.get("learningFormats"), user.getLearningFormats()));
        user.setWeeklyCommitment(str(profile.get("weeklyCommitment"), user.getWeeklyCommitment()));
        user.setLearningStyle(str(profile.get("learningStyle"), user.getLearningStyle()));
        // Deeper context captured during onboarding: situation, work setup,
        // blockers, and motivation — used by the AI and the roadmap engine.
        user.setEmploymentStatus(str(profile.get("employmentStatus"), user.getEmploymentStatus()));
        user.setWorkMode(str(profile.get("workMode"), user.getWorkMode()));
        user.setChallenges(str(profile.get("challenges"), user.getChallenges()));
        user.setMotivation(str(profile.get("motivation"), user.getMotivation()));
        users.save(user);
        skillService.recordUsage(splitSkills(interests));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Profile updated");
        result.put("user", authService.me(user).get("user"));
        return result;
    }

    private static List<String> splitSkills(String interests) {
        List<String> names = new ArrayList<>();
        if (interests == null || interests.isBlank()) return names;
        for (String part : interests.split(",")) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) names.add(trimmed);
        }
        return names;
    }

    private static String str(Object value, String fallback) {
        if (value == null) return fallback;
        String s = String.valueOf(value).trim();
        return s.isEmpty() ? fallback : s;
    }
}
