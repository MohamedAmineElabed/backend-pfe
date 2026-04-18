package com.example.authentify.repository;

import com.example.authentify.entity.PrincipeEntity;
//import com.example.authentify.entity.UserEntity;

//import java.lang.foreign.Linker.Option;
//import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
//Spring Data JPA’s CrudRepository/JpaRepository provides: findById/save/delete/findAll/deleteById

public interface PrincipeRepository extends JpaRepository<PrincipeEntity, Long> {
    boolean existsByNom(String nom);
    PrincipeEntity findByNom(String nom);

}
