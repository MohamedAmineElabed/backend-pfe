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

    // Fetch evaluations for a user along with their responses
    @Query("SELECT e FROM EvaluationEntity e LEFT JOIN FETCH e.reponses WHERE e.responsableId = :userId")
    List<EvaluationEntity> findByUserIdWithReponses(@Param("userId") Long userId);

    List<EvaluationEntity> findByOrganisme_Id(Long organismeId);

    // Fetch the latest evaluation for a given user
    @Query(
      value = "SELECT * FROM evaluations e WHERE e.organisme_id = :organismeId AND e.statut='terminé' ORDER BY e.date_Termination DESC LIMIT 1",
      nativeQuery = true)    
    Optional<EvaluationEntity> findLatestEval(@Param("organismeId") Long organismeId);


    /*@Query("SELECT e FROM EvaluationEntity e " +
       "LEFT JOIN FETCH e.reponses r " +
       "LEFT JOIN FETCH r.preuves " +
       "WHERE e.id = :id")
    Optional<EvaluationEntity> findByIdWithResponses(@Param("id") Long id);*/

    //fetch only evaluations with responsable actif
    @Query("""
      SELECT e FROM EvaluationEntity e WHERE e.organisme.responsable.etat = "actif"
    """)
    List<EvaluationEntity> findAllActive();

    // ── New year-aware methods ────────────────────────────────────────────

    // All evaluations for an organisme in a specific year
    List<EvaluationEntity> findByOrganismeIdAndAnnee(Long organismeId, Integer annee);

    // Latest terminée for an organisme in a specific year
    @Query("""
        SELECT e FROM EvaluationEntity e
        WHERE e.organisme.id = :organismeId
          AND e.annee = :annee
          AND e.statut = 'terminé'
        ORDER BY e.dateTermination DESC
        """)
    List<EvaluationEntity> findLatestTermineeByOrganismeAndAnnee(
        @Param("organismeId") Long organismeId,
        @Param("annee") Integer annee
    );

  // All terminées across all organismes for a given year (for ranking/labelisation)
    @Query("SELECT e FROM EvaluationEntity e WHERE e.annee = :annee AND e.statut = 'terminé'")
    List<EvaluationEntity> findAllTermineesByAnnee(@Param("annee") Integer annee);

    // All active evaluations for a given year
    @Query("""
        SELECT e FROM EvaluationEntity e
        WHERE e.organisme.responsable.etat = 'actif'
          AND e.annee = :annee
        """)
    List<EvaluationEntity> findAllActiveByAnnee(@Param("annee") Integer annee);

    // Check if organisme already has a non-cancelled eval this year
    // Used to block creating a second evaluation in the same year
    boolean existsByOrganismeIdAndAnneeAndStatutNot(
        Long organismeId, Integer annee, String statut
    );

    // All distinct years that have evaluations (for history dropdown)
    @Query("SELECT DISTINCT e.annee FROM EvaluationEntity e WHERE e.annee IS NOT NULL ORDER BY e.annee DESC")
    List<Integer> findDistinctAnnees();

    // All distinct years that have evaluations (for history dropdown) for a specific organisme
    @Query("SELECT DISTINCT e.annee FROM EvaluationEntity e WHERE e.organisme.id = :organismeId AND e.annee IS NOT NULL ORDER BY e.annee DESC")
    List<Integer> findDistinctAnneesByOrganisme(@Param("organismeId") Long organismeId);

    // All evaluations for a given year
    @Query("""
        SELECT e FROM EvaluationEntity e
        WHERE e.annee = :annee
        """)
    List<EvaluationEntity> findAllByAnnee(@Param("annee") Integer annee); 


    
    

}
