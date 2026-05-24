package com.example.authentify.controller;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.http.ResponseEntity;

//import com.example.authentify.entity.OrganismeEntity;

import com.example.authentify.entity.PratiqueEntity;
import com.example.authentify.entity.PrincipeEntity;
//import com.example.authentify.entity.DemandeEntity;
import com.example.authentify.io.PrincipeRequest;
import com.example.authentify.io.PrincipeResponse;
//import com.example.authentify.repository.DemandeRepository;
//import com.example.authentify.service.EmailService;
import com.example.authentify.repository.PratiqueRepository;
import com.example.authentify.repository.PrincipeRepository;
import com.example.authentify.service.PrincipeService;
//import java.util.Map;
import java.util.List;
//import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/v1.0/pratiques")
@RequiredArgsConstructor
public class PratiqueController {
    private final PratiqueRepository pratiqueRepository;
    private final PrincipeRepository principeRepository;
    private final PrincipeService principeService;

    @GetMapping("/{id}")
    public PratiqueEntity getPratiquesById(@PathVariable Long id) {
        return pratiqueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pratique not found"));
    }

    @GetMapping
    public ResponseEntity<List<PratiqueEntity>> getAllPratiques() {
        List<PratiqueEntity> pratiques = principeService.getAllPratiques();
        return ResponseEntity.ok(pratiques);
    }

    @PostMapping("/create/{id}")
    public ResponseEntity<PrincipeResponse> createPratique( @PathVariable Long id, @RequestBody PrincipeRequest request) {
        //fetch the parent principe
        PrincipeEntity principe =principeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Principe not found"));

        /*PrincipeResponse response = principeService.createPratique(request);
        return ResponseEntity.ok(response);*/
        //create new pratiqie
        PratiqueEntity pratique = new PratiqueEntity();
        pratique.setNom(request.getNom());
        pratique.setDescription(request.getDescription());
        pratique.setPrincipe(principe); 

        //save new pratique 
        pratiqueRepository.save(pratique);

        // Prepare response
        PrincipeResponse response = new PrincipeResponse();
        response.setId(pratique.getId());
        response.setNom(pratique.getNom());
        response.setDescription(pratique.getDescription());

    return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePratique(@PathVariable Long id) {
        principeService.deletePratique(id);
    return ResponseEntity.ok("Pratique supprimée avec succès");
}
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePratique(@RequestBody PratiqueEntity pratique) {
        principeService.updatePratique(pratique);
        return ResponseEntity.ok("Updated");
}

}
