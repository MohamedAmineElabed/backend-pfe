package com.example.authentify.repository;

import com.example.authentify.entity.OrganismeEntity;

//import java.lang.foreign.Linker.Option;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;


public interface OrganismeRepository extends JpaRepository<OrganismeEntity, Long> {
    // You can add custom query methods here
    Optional<OrganismeEntity> findByEmailOrganisme(String emailOrganisme);
    //Optional<OrganismeEntity> findByRole(String role);
    boolean existsByEmailOrganisme(String emailOrganisme); // Check if organisme with the given email already exists
    void deleteById( @NonNull Long id); // Delete organisme by ID


}





