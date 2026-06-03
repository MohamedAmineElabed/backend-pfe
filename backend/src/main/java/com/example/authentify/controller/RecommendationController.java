package com.example.authentify.controller;

import com.example.authentify.config.ContextAssembler;
import com.example.authentify.entity.EvaluationEntity;
import com.example.authentify.repository.EvaluationRepository;
import com.example.authentify.service.PromptBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1.0/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

    /*@Value("${anthropic.api.key}")
    private String apiKey;*/
    @Value("${groq.api.key}")
    private String groqApiKey;


    @Autowired private EvaluationRepository evaluationRepo;
    @Autowired private ContextAssembler contextAssembler;
    @Autowired private PromptBuilder promptBuilder;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // ── Generate for ONE evaluation ──────────────────────────────
    @PostMapping("/{evaluationId}")
    public ResponseEntity<String> generateOne(@PathVariable Long evaluationId) {

        EvaluationEntity evaluation = evaluationRepo
            .findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found: " + evaluationId));

        // return cached result if already generated
        if (evaluation.getRecommandations() != null) {
            return ResponseEntity.ok(evaluation.getRecommandations());
        }

        String result = callClaude(evaluation);

        // save to DB — next call will be instant
        evaluation.setRecommandations(result);
        evaluationRepo.save(evaluation);

        return ResponseEntity.ok(result);
    }

    // ── Force regenerate (clears cache) ─────────────────────────
    @DeleteMapping("/{evaluationId}/cache")
    public ResponseEntity<Void> clearCache(@PathVariable Long evaluationId) {
        EvaluationEntity evaluation = evaluationRepo
            .findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found: " + evaluationId));
        evaluation.setRecommandations(null);
        evaluationRepo.save(evaluation);
        return ResponseEntity.noContent().build();
    }

    // ── Shared: build prompt + call Anthropic ────────────────────
    /*private String callClaude(EvaluationEntity evaluation) {

        String context = contextAssembler.assemble(evaluation);
        String prompt  = promptBuilder.build(
            evaluation.getOrganisme().getNomOrganisme(),
            context
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
            "model",      "claude-sonnet-4-20250514",
            "max_tokens", 1000,
            "messages",   List.of(
                Map.of("role", "user", "content", prompt)
            )
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
            "https://api.anthropic.com/v1/messages",
            new HttpEntity<>(body, headers),
            String.class
        );

        return extractText(response.getBody());
    }

    // ── Extract text block from Anthropic response envelope ──────
    private String extractText(String anthropicResponse) {
        try {
            var root    = mapper.readTree(anthropicResponse);
            var content = root.get("content");
            if (content != null && content.isArray() && !content.isEmpty()) {
                return content.get(0).get("text").asText();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return anthropicResponse;
    }*/
    // Replace the callClaude() method with this:
    private String callClaude(EvaluationEntity evaluation) {

    String context = contextAssembler.assemble(evaluation);
    String prompt  = promptBuilder.build(
        evaluation.getOrganisme().getNomOrganisme(),
        context
    );

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + groqApiKey);

    Map<String, Object> body = Map.of(
        "model",    "llama-3.3-70b-versatile",
        "messages", List.of(
            Map.of("role", "user", "content", prompt)
        ),
        "max_tokens", 4000
    );

    ResponseEntity<String> response = restTemplate.postForEntity(
        "https://api.groq.com/openai/v1/chat/completions",
        new HttpEntity<>(body, headers),
        String.class
    );

    return extractTextGroq(response.getBody());
}

private String extractTextGroq(String groqResponse) {
    try {
        var root = mapper.readTree(groqResponse);
        String text=root
            .get("choices").get(0)
            .get("message")
            .get("content").asText();

        // Strip DeepSeek thinking block
        text = text.replaceAll("(?s)<think>.*?</think>", "").trim();
        
        // Extract only the JSON part
        int start = text.indexOf("{");
        int end   = text.lastIndexOf("}");
        if (start != -1 && end != -1) {
            return text.substring(start, end + 1);
        }
        return text;
    } catch (Exception e) {
        e.printStackTrace();
    }
    return groqResponse;
}

}