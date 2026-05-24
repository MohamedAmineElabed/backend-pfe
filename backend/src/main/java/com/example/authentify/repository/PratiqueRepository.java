package com.example.authentify.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.authentify.entity.PratiqueEntity;

public interface PratiqueRepository extends JpaRepository<PratiqueEntity, Long> {
    boolean existsByNom(String nom);

}
