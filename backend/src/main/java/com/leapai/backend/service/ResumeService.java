package com.leapai.backend.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Resume analysis. Extracts text from PDF/TXT uploads (or pasted text), then
 * uses the LLM to pull the skills it mentions. Found skills are upserted into
 * the skills catalog so they become selectable by anyone later.
 */
@Service
public class ResumeService {

    private static final Logger log = LoggerFactory.getLogger(ResumeService.class);
    private static final int MAX_PDF_BYTES = 5 * 1024 * 1024;

    private final LlmService llmService;
    private final SkillService skillService;

    public ResumeService(LlmService llmService, SkillService skillService) {
        this.llmService = llmService;
        this.skillService = skillService;
    }

    /** True when real AI analysis is available (key configured + free model guard passed). */
    public boolean available() {
        return llmService.isConfigured();
    }

    /**
     * Analyze resume text and return the skills found, each upserted into the
     * catalog with an {@code inCatalog} flag (true = already existed).
     */
    public Map<String, Object> analyze(String text) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (!available()) {
            result.put("ok", false);
            result.put("error", "Resume analysis is temporarily unavailable — the AI service isn't configured right now.");
            return result;
        }
        if (text == null || text.isBlank() || text.trim().length() < 40) {
            result.put("ok", false);
            result.put("error", "That doesn't look like a resume — please paste more text or upload your resume file.");
            return result;
        }

        List<Map<String, String>> extracted = llmService.extractSkillsFromResume(text);
        List<Map<String, Object>> skills = new ArrayList<>();
        for (Map<String, String> item : extracted) {
            skills.add(skillService.ensure(item.get("name"), item.get("category")));
        }
        result.put("ok", true);
        result.put("source", "llm");
        result.put("skills", skills);
        result.put("count", skills.size());
        return result;
    }

    /** Extract text from a PDF resume. Throws IOException when unreadable. */
    public String extractPdfText(byte[] bytes) throws IOException {
        if (bytes == null || bytes.length == 0 || bytes.length > MAX_PDF_BYTES) {
            throw new IOException("PDF is empty or larger than 5MB.");
        }
        try (PDDocument doc = PDDocument.load(new ByteArrayInputStream(bytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            if (text == null || text.trim().length() < 40) {
                throw new IOException("Could not read text from this PDF — it may be a scanned image.");
            }
            return text;
        }
    }

    /** Extract text from a plain-text resume. */
    public String extractTxtText(byte[] bytes) {
        return new String(bytes, StandardCharsets.UTF_8);
    }
}
