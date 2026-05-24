package com.example.authentify.controller;
import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.RequestParam;

import com.example.authentify.entity.EvaluationEntity;

import com.example.authentify.entity.ScoreParPrincipeEntity;

//import com.example.authentify.entity.OrganismeEntity;

import com.example.authentify.repository.EvaluationRepository;
//import com.example.authentify.repository.PrincipeRepository;
//import com.example.authentify.io.ReponseRequest;
//import com.example.authentify.repository.DemandeRepository;
import com.example.authentify.service.ScoreParPrincipeService;
//import java.util.Map;
import java.util.List;

import lombok.Data;
//import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.ResponseStatus;
//import static java.util.Map.entry;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
 

@RestController
@RequestMapping("/api/v1.0/scoreParPrincipe")
@RequiredArgsConstructor
public class ScoreParPrincipeController {
    //private final EvaluationServiceImp evaluationService;
    //private final PrincipeService principeService;
    private final ScoreParPrincipeService scoreParPrincipeService;
    private final EvaluationRepository evaluationRepository;

    @PostMapping("/enregistrer")
    public ResponseEntity<ScoreParPrincipeEntity> enregistrerScore(@RequestBody ScoreInput input) {
        EvaluationEntity evaluation=evaluationRepository.findById(input.getEvaluationId())
            .orElseThrow(() -> new RuntimeException("Evaluation not found"));
        
        // Save score
        ScoreParPrincipeEntity savedScore = scoreParPrincipeService.enregistrerScore(
                evaluation,
                input.getResponsableId(),
                input.getOrganismeId(),
                input.getPrincipeId(),
                input.getScore()
                //input.getScoreMax()
        );
        return ResponseEntity.ok(savedScore);
    }

    @Data
    public static class ScoreInput {
        private Long evaluationId;
        private Long responsableId;
        private Long organismeId;
        private Long principeId;
        private Integer score;
        //private Integer scoreMax;
    }

    @GetMapping("/scores")
    public List<ScoreParPrincipeEntity> getAllScores() {
        return scoreParPrincipeService.getAllScores();
    }

    @GetMapping("/evaluation/{evaluationId}")
    public List<ScoreParPrincipeEntity> getScoresByEvaluation(@PathVariable Long evaluationId) {
        return scoreParPrincipeService.getScoresByEvaluationId(evaluationId);
    }

    @GetMapping("/organisme/{organismeId}")
    public List<ScoreParPrincipeEntity> getScoresByOrganisme(@PathVariable Long organismeId) {
        if (organismeId == null) return List.of();
        return scoreParPrincipeService.getScoresByOrganismeId(organismeId);
    }

    @PutMapping("/refresh/{evaluationId}")
    public ResponseEntity<Void> refreshScoreMax(@PathVariable Long evaluationId) {
        scoreParPrincipeService.refreshScoreMaxParPrincipe(evaluationId);
        return ResponseEntity.ok().build();
}
    
}
