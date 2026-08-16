package com.leapai.backend.controller;

import com.leapai.backend.config.UserContext;
import com.leapai.backend.service.ResumeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    /** Analyze an uploaded resume file (PDF or TXT). */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> analyzeFile(
            @RequestParam("file") MultipartFile file) {
        try {
            String filename = file.getOriginalFilename() == null
                    ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
            byte[] bytes = file.getBytes();
            String text;
            if (filename.endsWith(".pdf")) {
                text = resumeService.extractPdfText(bytes);
            } else if (filename.endsWith(".txt")) {
                text = resumeService.extractTxtText(bytes);
            } else {
                return bad("Upload a .pdf or .txt file — or paste your resume text instead.");
            }
            return respond(text);
        } catch (Exception e) {
            return bad("Couldn't read that resume: " + e.getMessage());
        }
    }

    /** Analyze pasted resume text. */
    @PostMapping(value = "/analyze", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> analyzeText(@RequestBody Map<String, Object> body) {
        return respond(String.valueOf(body == null ? "" : body.getOrDefault("text", "")));
    }

    private ResponseEntity<Map<String, Object>> respond(String text) {
        Map<String, Object> result = resumeService.analyze(text, UserContext.require().getId());
        if (Boolean.FALSE.equals(result.get("ok"))) {
            return bad(String.valueOf(result.get("error")));
        }
        return ResponseEntity.ok(result);
    }

    private static ResponseEntity<Map<String, Object>> bad(String message) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", false);
        res.put("error", message);
        return ResponseEntity.badRequest().body(res);
    }
}
