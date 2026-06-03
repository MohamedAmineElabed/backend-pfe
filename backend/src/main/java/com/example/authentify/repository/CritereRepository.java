package com.example.authentify.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.authentify.entity.CritereEntity; 

public interface CritereRepository extends JpaRepository<CritereEntity, Long> {
    boolean existsByNom(String nom);
    boolean existsByNomAndPratiqueId(String nom, Long pratiqueId);

}
