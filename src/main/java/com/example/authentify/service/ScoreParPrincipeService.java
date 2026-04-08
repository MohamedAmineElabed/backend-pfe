package com.example.authentify.service;

import com.example.authentify.entity.EvaluationEntity;
//import com.example.authentify.entity.EvaluationEntity;
//import com.example.authentify.entity.ReponseEntity;
import com.example.authentify.entity.ScoreParPrincipeEntity;
import com.example.authentify.repository.PrincipeRepository;
import com.example.authentify.repository.ScoreParPrincipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
//import org.springframework.beans.factory.annotation.Autowired;

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
    Long principeId, Integer score, Integer scoreMax) {
    if (!principeRepository.existsById(principeId)) {
        throw new RuntimeException("Principe not found with id: " + principeId);
    }
    return scoreParPrincipeRepository.findByEvaluationIdAndPrincipeId(evaluation.getId(), principeId)
        .map(existing -> {
            existing.setScore(score);
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