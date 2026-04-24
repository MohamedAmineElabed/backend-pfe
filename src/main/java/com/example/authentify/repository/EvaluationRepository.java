package com.example.authentify.repository;
import com.example.authentify.entity.EvaluationEntity;
//import com.example.authentify.entity.UserEntity;
//import com.example.authentify.entity.ReponseEntity;

//import java.lang.foreign.Linker.Option;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
//Spring Data JPA’s CrudRepository/JpaRepository provides: findById/save/delete/findAll/deleteById
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EvaluationRepository extends JpaRepository<EvaluationEntity, Long> {
    List<EvaluationEntity> findByOrganismeId(Long organismeId);
    //List<EvaluationEntity> findByUserId(Long userId);
    @Query("SELECT e FROM EvaluationEntity e LEFT JOIN FETCH e.reponses WHERE e.responsableId = :userId")
    List<EvaluationEntity> findByUserIdWithReponses(@Param("userId") Long userId);

    List<EvaluationEntity> findByOrganisme_Id(Long organismeId);

    // Fetch the latest evaluation for a given user
    @Query(
      value = "SELECT * FROM evaluations e WHERE e.responsable_id = :userId AND e.statut='terminé' ORDER BY e.date_soumission DESC LIMIT 1",
      nativeQuery = true
    )    
    Optional<EvaluationEntity> findLatestEval(@Param("userId") Long userId);


    /*@Query("SELECT e FROM EvaluationEntity e " +
       "LEFT JOIN FETCH e.reponses r " +
       "LEFT JOIN FETCH r.preuves " +
       "WHERE e.id = :id")
    Optional<EvaluationEntity> findByIdWithResponses(@Param("id") Long id);*/

    //fetch only evaluations with responsable actif
    @Query("""
      SELECT e FROM EvaluationEntity e
        WHERE e.organisme.responsable.etat = "actif"
    """)
    List<EvaluationEntity> findAllActive();
    
    

}
