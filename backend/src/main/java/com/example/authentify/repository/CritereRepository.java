package com.example.authentify.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.authentify.entity.CritereEntity;
import com.example.authentify.entity.EvaluationEntity; 

import java.util.List;

public interface CritereRepository extends JpaRepository<CritereEntity, Long> {
    boolean existsByNom(String nom);
    boolean existsByNomAndPratiqueId(String nom, Long pratiqueId);

    
}
