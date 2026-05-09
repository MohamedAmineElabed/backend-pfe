package com.example.authentify.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

import com.example.authentify.entity.ScoreParPrincipeEntity;

@Repository
public interface ScoreParPrincipeRepository extends JpaRepository<ScoreParPrincipeEntity, Long> {
    Optional<ScoreParPrincipeEntity> findByEvaluation_IdAndPrincipeId(Long evaluationId, Long principeId);
    List<ScoreParPrincipeEntity> findByEvaluation_Id(Long evaluationId);
    List<ScoreParPrincipeEntity> findByOrganismeId(Long organismeId);
    List<ScoreParPrincipeEntity> findByPrincipeId(Long principeId);

}
