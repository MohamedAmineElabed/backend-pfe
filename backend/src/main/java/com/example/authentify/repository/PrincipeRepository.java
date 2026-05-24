package com.example.authentify.repository;

import com.example.authentify.entity.PrincipeEntity;
//import com.example.authentify.entity.UserEntity;

//import java.lang.foreign.Linker.Option;
//import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
//Spring Data JPA’s CrudRepository/JpaRepository provides: findById/save/delete/findAll/deleteById
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PrincipeRepository extends JpaRepository<PrincipeEntity, Long> {
    boolean existsByNom(String nom);
    PrincipeEntity findByNom(String nom);

    // Counts all critères belonging to a principe (through pratiques)
    @Query("SELECT COUNT(c) FROM CritereEntity c WHERE c.pratique.principe.id = :principeId")
    int countCriteresByPrincipeId(@Param("principeId") Long principeId);


}
