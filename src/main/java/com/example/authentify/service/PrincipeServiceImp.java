package com.example.authentify.service;

import org.springframework.stereotype.Service;
//import org.springframework.web.bind.annotation.PathVariable;
//import java.util.Optional;
import java.util.List;

//import com.example.authentify.entity.DemandeEntity;
import com.example.authentify.entity.PrincipeEntity;
//import com.example.authentify.entity.UserEntity;
import com.example.authentify.entity.PratiqueEntity;
import com.example.authentify.entity.CritereEntity;
//import com.example.authentify.entity.OrganismeEntity;
import com.example.authentify.io.PrincipeRequest;
import com.example.authentify.io.PrincipeResponse;


//import com.example.authentify.io.OrganismeRequest;

//import com.example.authentify.io.ProfileResponse;
//import com.example.authentify.repository.DemandeRepository;
//import com.example.authentify.repository.UserRepository;
import com.example.authentify.repository.PrincipeRepository;
import com.example.authentify.repository.PratiqueRepository;
import com.example.authentify.repository.CritereRepository;
//import com.example.authentify.repository.OrganismeRepository;
//import java.lang.Long;
//import java.util.concurrent.ThreadLocalRandom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrincipeServiceImp implements PrincipeService {
    private final PrincipeRepository principeRepository;
    private final PratiqueRepository pratiqueRepository;
    private final CritereRepository  critereRepository;

//////////////////Principe/////////////////////////////////////////
    @Override
    public PrincipeResponse createPrincipe(PrincipeRequest request) {
        if (principeRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Principe already exists");
        }

        PrincipeEntity newPrincipe = convertToPrincipeEntity(request);
        PrincipeEntity savedPrincipe = principeRepository.save(newPrincipe);
        return convertToPrincipeResponse(savedPrincipe);
    }

     @Override
    public List<PrincipeEntity> getAllPrincipes() {
        return principeRepository.findAll();
    }
    
    private PrincipeEntity convertToPrincipeEntity(PrincipeRequest request) {     
        PrincipeEntity principeEntity = PrincipeEntity.builder()
            .nom(request.getNom())
            .description(request.getDescription())
            .build();

        return principeEntity;
    }
    
    private PrincipeResponse convertToPrincipeResponse(PrincipeEntity principeEntity) {
    // Construire le ProfileResponse de base
    PrincipeResponse response = PrincipeResponse.builder()
            .id(principeEntity.getId())
            .nom(principeEntity.getNom())
            .description(principeEntity.getDescription())
            .build();
    return response;
}

    @Override
    public void deletePrincipe(Long id) {
        PrincipeEntity principe = principeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande not found with id: " + id));
        principeRepository.delete(principe);
}
    //pour editer principe
    public PrincipeEntity updatePrincipe(PrincipeEntity newPrincipe){

    PrincipeEntity principe = principeRepository.findById(newPrincipe.getId())
        .orElseThrow(() -> new RuntimeException("Principe not found"));
    
    if(newPrincipe.getNom().trim().isEmpty())
        {throw new RuntimeException("Principe ne doit étre pas vide");}
    if(newPrincipe.getDescription().trim().isEmpty())
        {throw new RuntimeException("Description ne doit étre pas vide");}

    boolean exists = principeRepository.existsByNom(newPrincipe.getNom());
    if (exists && !principe.getId().equals(newPrincipe.getId())) {
        throw new RuntimeException("Principe with this name already exists");
    }
    /*if (principeRepository.existsByNom(newPrincipe.getNom())) {
            throw new RuntimeException("Principe already exists");
        }*/

    principe.setNom(newPrincipe.getNom());
    principe.setDescription(newPrincipe.getDescription());

    /*if(newCritere.getPratique() != null){
        PratiqueEntity pratique = pratiqueRepository
            .findById(newCritere.getPratique().getId())
            .orElseThrow(() -> new RuntimeException("Pratique not found"));

        critere.setPratique(pratique);
    }*/

    return principeRepository.save(principe);
}


//////////////////Pratique/////////////////////////////////////////
    @Override
    public PrincipeResponse createPratique(PrincipeRequest request) {
        if (pratiqueRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Pratique already exists");
        }
        

        PratiqueEntity newPratique = convertToPratiqueEntity(request);
        PratiqueEntity savedPratique = pratiqueRepository.save(newPratique);
        return convertToPrincipeResponse(savedPratique);
    }

     @Override
    public List<PratiqueEntity> getAllPratiques() {
        return pratiqueRepository.findAll();
    }
    
    private PratiqueEntity convertToPratiqueEntity(PrincipeRequest request) {     
        PratiqueEntity pratiqueEntity = PratiqueEntity.builder()
            .nom(request.getNom())
            .description(request.getDescription())
            .build();

        return pratiqueEntity;
    }
    
    private PrincipeResponse convertToPrincipeResponse(PratiqueEntity pratiqueEntity) {
    // Construire le ProfileResponse de base
    PrincipeResponse response = PrincipeResponse.builder()
            .id(pratiqueEntity.getId())
            .nom(pratiqueEntity.getNom())
            .description(pratiqueEntity.getDescription())
            .build();
    return response;
}

    @Override
    public void deletePratique(Long id) {
        PratiqueEntity pratique = pratiqueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pratique not found with id: " + id));
        pratiqueRepository.delete(pratique);
}

    //pour editer pratique
    public PratiqueEntity updatePratique(PratiqueEntity newPratique){

    PratiqueEntity pratique = pratiqueRepository.findById(newPratique.getId())
        .orElseThrow(() -> new RuntimeException("Pratique not found"));
    // Check if another pratique has the same nom
    boolean exists = pratiqueRepository.existsByNom(newPratique.getNom());
    if (exists) {
        throw new RuntimeException("Pratique with this name already exists");
    }
    if(newPratique.getNom().trim().isEmpty())
        {throw new RuntimeException("Pratique ne doit étre pas vide");}
    /*if(newPratique.getDescription().trim().isEmpty())
        {throw new RuntimeException("Description ne doit étre pas vide");}*/
    if (exists && !pratique.getId().equals(newPratique.getId())) {
        throw new RuntimeException("Pratique with this name already exists");
    }
    /*if (pratiqueRepository.existsByNom(newPratique.getNom())) {
            throw new RuntimeException("Pratique already exists");
        }*/

    pratique.setNom(newPratique.getNom());
    pratique.setDescription(newPratique.getDescription());

    /*if(newCritere.getPratique() != null){
        PratiqueEntity pratique = pratiqueRepository
            .findById(newCritere.getPratique().getId())
            .orElseThrow(() -> new RuntimeException("Pratique not found"));

        critere.setPratique(pratique);
    }*/

    return pratiqueRepository.save(pratique);
}


//////////////////Critere/////////////////////////////////////////
    @Override
    public PrincipeResponse createCritere(PrincipeRequest request) {
        if (critereRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Critere already exists");
        }

        CritereEntity newCritere = convertToCritereEntity(request);
        CritereEntity savedCritere = critereRepository.save(newCritere);
        return convertToPrincipeResponse(savedCritere);
    }

     @Override
    public List<CritereEntity> getAllCriteres() {
        return critereRepository.findAll();
    }
    
    private CritereEntity convertToCritereEntity(PrincipeRequest request) {     
        CritereEntity critereEntity = CritereEntity.builder()
            .nom(request.getNom())
            .description(request.getDescription())
            .build();

        return critereEntity;
    }
    
    private PrincipeResponse convertToPrincipeResponse(CritereEntity critereEntity) {
    // Construire le ProfileResponse de base
    PrincipeResponse response = PrincipeResponse.builder()
            .id(critereEntity.getId())
            .nom(critereEntity.getNom())
            .description(critereEntity.getDescription())
            .build();
    return response;
}

    @Override
    public void deleteCritere(Long id) {
        CritereEntity critere = critereRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pratique not found with id: " + id));
        critereRepository.delete(critere);
}

    public CritereEntity updateCritere(CritereEntity newCritere){

    CritereEntity critere = critereRepository.findById(newCritere.getId())
        .orElseThrow(() -> new RuntimeException("Critere not found"));
    /*boolean exists = critereRepository.existsByNom(newCritere.getNom());
    if (exists) {
        throw new RuntimeException("Critére already exists");
    }*/
   if(newCritere.getNom().trim().isEmpty())
        {throw new RuntimeException("Critere ne doit étre pas vide");}

    critere.setNom(newCritere.getNom());
    critere.setDescription(newCritere.getDescription());

    if(newCritere.getPratique() != null){
        PratiqueEntity pratique = pratiqueRepository
            .findById(newCritere.getPratique().getId())
            .orElseThrow(() -> new RuntimeException("Pratique not found"));

        critere.setPratique(pratique);
    }

    return critereRepository.save(critere);
}

    public PrincipeEntity getCritereById(Long id) {
        return principeRepository.findById(id).orElse(null);
}




}
