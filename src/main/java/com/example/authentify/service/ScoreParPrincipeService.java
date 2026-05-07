package com.example.authentify.service;

import com.example.authentify.entity.EvaluationEntity;
//import com.example.authentify.entity.PrincipeEntity;
//import com.example.authentify.entity.ReponseEntity;
//import com.example.authentify.entity.EvaluationEntity;
//import com.example.authentify.entity.ReponseEntity;
import com.example.authentify.entity.ScoreParPrincipeEntity;
import com.example.authentify.repository.PrincipeRepository;
import com.example.authentify.repository.ScoreParPrincipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
//import java.util.Set;
//import org.springframework.beans.factory.annotation.Autowired;
//import java.util.stream.Collectors;

@Service
public class ScoreParPrincipeService {
     private final ScoreParPrincipeRepository scoreParPrincipeRepository;
     private final PrincipeRepository principeRepository;


    public ScoreParPrincipeService(ScoreParPrincipeRepository scoreParPrincipeRepository, PrincipeRepository principeRepository) {
        this.scoreParPrincipeRepository = scoreParPrincipeRepository;
        this.principeRepository = principeRepository;
    }

@Transactional // ensures atomicity of the operation
public ScoreParPrincipeEntity enregistrerScore(EvaluationEntity evaluation, Long responsableId, Long organismeId, 
    Long principeId, Integer score) {
    if (!principeRepository.existsById(principeId)) {
        throw new RuntimeException("Principe not found with id: " + principeId);
    }
    int scoreMax = principeRepository.countCriteresByPrincipeId(principeId) * 3;
    return scoreParPrincipeRepository.findByEvaluationIdAndPrincipeId(evaluation.getId(), principeId)
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
public void refreshScoreMaxParPrincipe(Long evaluationId) {
        List<ScoreParPrincipeEntity> scores =scoreParPrincipeRepository.findByEvaluationId(evaluationId);
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
    return scoreParPrincipeRepository.findByEvaluationId(evaluationId);
}
public List<ScoreParPrincipeEntity>getScoresByOrganismeId(Long organismeId){
    return scoreParPrincipeRepository.findByOrganismeId(organismeId);
}


}