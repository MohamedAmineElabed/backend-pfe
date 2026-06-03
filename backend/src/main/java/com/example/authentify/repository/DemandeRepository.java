package com.example.authentify.repository;

import com.example.authentify.entity.DemandeEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;


public interface DemandeRepository extends JpaRepository<DemandeEntity, Long> {
    Optional<DemandeEntity> findByEmail(String email);
    boolean existsByEmail(String email); // Check if a user with the given email already exists
    boolean existsByEmailOrganisme(String emailOrganisme); // Check if a user with the given organisme email already exists
    void deleteByEmail(String email); // Delete a user by email
}
