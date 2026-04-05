package com.example.authentify.repository;
import com.example.authentify.entity.ReponseEntity;
//import com.example.authentify.entity.UserEntity;

//import java.lang.foreign.Linker.Option;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
//Spring Data JPA’s CrudRepository/JpaRepository provides: findById/save/delete/findAll/deleteById

public interface ReponseRepository extends JpaRepository<ReponseEntity, Long> {
    // Récupérer une réponse par évaluation et critère
    Optional<ReponseEntity> findByEvaluationIdAndCritereId(Long evaluationId, Long critereId);
    // Récupérer toutes les réponses d'une évaluation
    List<ReponseEntity> findByEvaluationId(Long evaluationId);
    
}
