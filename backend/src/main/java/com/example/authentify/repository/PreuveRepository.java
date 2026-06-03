package com.example.authentify.repository;
import com.example.authentify.entity.PreuveEntity;
//import com.example.authentify.entity.UserEntity;
//import com.example.authentify.entity.ReponseEntity;

//import java.lang.foreign.Linker.Option;
//import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreuveRepository extends JpaRepository<PreuveEntity, Long> {
    // Récupérer toutes les preuves d'une réponse
    List<PreuveEntity> findByReponseId(Long reponseId);

}
