package com.example.authentify.service;

import com.example.authentify.entity.EvaluationEntity;
import com.example.authentify.entity.ReponseEntity;
//import com.example.authentify.entity.PrincipeEntity;
//import com.example.authentify.entity.ReponseEntity;
//import com.example.authentify.entity.EvaluationEntity;
//import com.example.authentify.entity.ReponseEntity;
import com.example.authentify.entity.ScoreParPrincipeEntity;
import com.example.authentify.repository.PrincipeRepository;
import com.example.authentify.repository.ReponseRepository;
import com.example.authentify.repository.CritereRepository;
import com.example.authentify.repository.ScoreParPrincipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
//import org.springframework.beans.factory.annotation.Autowired;
//import java.util.stream.Collectors;

@Service
public class ScoreParPrincipeService {
     private final ScoreParPrincipeRepository scoreParPrincipeRepository;
     private final PrincipeRepository principeRepository;
     private final ReponseRepository reponseRepository;
     private final CritereRepository critereRepository;


    public ScoreParPrincipeService(ScoreParPrincipeRepository scoreParPrincipeRepository, PrincipeRepository principeRepository, ReponseRepository reponseRepository, CritereRepository critereRepository) {
        this.scoreParPrincipeRepository = scoreParPrincipeRepository;
        this.principeRepository = principeRepository;
        this.reponseRepository = reponseRepository;
        this.critereRepository = critereRepository;
    }

@Transactional // ensures atomicity of the operation
public ScoreParPrincipeEntity enregistrerScore(EvaluationEntity evaluation, Long responsableId, Long organismeId, 
    Long principeId, Integer score) {
    if (!principeRepository.existsById(principeId)) {
        throw new RuntimeException("Principe not found with id: " + principeId);
    }
    int scoreMax = principeRepository.countCriteresByPrincipeId(principeId) * 3;
    
    return scoreParPrincipeRepository.findByEvaluation_IdAndPrincipeId(evaluation.getId(), principeId)
        .map(existing -> {
            existing.setScore(score);
            existing.setScoreMax(scoreMax);
            return scoreParPrincipeRepository.save(existing);
        })
        .orElseGet(() -> {
            ScoreParPrincipeEntity newScore = ScoreParPrincipeEntity.builder()
                .evaluation(evaluation)
                .responsableId(responsableId)
                .organismeId(organismeId)
                .principeId(principeId)
                .score(score)
                .scoreMax(scoreMax)
                .build();
            return scoreParPrincipeRepository.save(newScore);
        });
}

// Call this after any critère add/delete
@Transactional
public void refreshScoreMaxParPrincipe(Long principeId) {
        int currentYear = java.time.LocalDate.now().getYear();
        List<ScoreParPrincipeEntity> scores =scoreParPrincipeRepository.findByPrincipeId(principeId)
        .stream()
        .filter(s -> s.getEvaluation() != null && s.getEvaluation().getAnnee() == currentYear)
        .toList();
        scores.forEach(s -> {
            int freshMax = principeRepository.countCriteresByPrincipeId(s.getPrincipeId()) * 3;
            s.setScoreMax(freshMax);
        });
        scoreParPrincipeRepository.saveAll(scores);
}

public List<ScoreParPrincipeEntity> getAllScores() {
    return scoreParPrincipeRepository.findAll();
}

public List<ScoreParPrincipeEntity>getScoresByEvaluationId(Long evaluationId){
    return scoreParPrincipeRepository.findByEvaluation_Id(evaluationId);
}
public List<ScoreParPrincipeEntity>getScoresByOrganismeId(Long organismeId){
    return scoreParPrincipeRepository.findByOrganismeId(organismeId);
}

public void UpdateScoreParPrincipe(Long evaluationId, EvaluationEntity evaluation) {
    List<ReponseEntity> allReponses = reponseRepository.findByEvaluationId(evaluationId);

    // Group validated responses by principeId
    Map<Long, Integer> scoreByPrincipe = new HashMap<>();
    for (ReponseEntity r : allReponses) {
        if (!"validé".equals(r.getStatut()) || r.getValeur() == null || r.getCritereId() == null) continue;
        // Look up which principe this critère belongs to
        critereRepository.findById(r.getCritereId()).ifPresent(critere -> {
            if (critere.getPratique() == null || critere.getPratique().getPrincipe() == null) {
                return;
            }
            Long principeId = critere.getPratique().getPrincipe().getId(); 
            scoreByPrincipe.merge(principeId, r.getValeur(), Integer::sum);
        });
    }

    for (Map.Entry<Long, Integer> entry : scoreByPrincipe.entrySet()) {
        Long principeId = entry.getKey();
        int scoreParPrincipe = entry.getValue();
        int scoreMaxParPrincipe = principeRepository.countCriteresByPrincipeId(principeId) * 3;
        ScoreParPrincipeEntity spp = scoreParPrincipeRepository.findByEvaluation_IdAndPrincipeId(evaluationId, principeId) 
            .orElseGet(() -> ScoreParPrincipeEntity.builder()
                .evaluation(evaluation)
                .organismeId(evaluation.getOrganisme().getId())
                .principeId(principeId)
                .build());

        spp.setScore(scoreParPrincipe);
        spp.setScoreMax(scoreMaxParPrincipe);
        scoreParPrincipeRepository.save(spp);
    }
}


}