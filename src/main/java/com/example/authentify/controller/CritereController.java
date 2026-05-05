package com.example.authentify.controller;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.http.ResponseEntity;

//import com.example.authentify.entity.OrganismeEntity;

import com.example.authentify.entity.PratiqueEntity;
//import com.example.authentify.entity.UserEntity;
import com.example.authentify.entity.CritereEntity;
import com.example.authentify.io.PrincipeRequest;
import com.example.authentify.io.PrincipeResponse;
//import com.example.authentify.repository.DemandeRepository;
//import com.example.authentify.service.EmailService;
import com.example.authentify.repository.PratiqueRepository;
import com.example.authentify.repository.CritereRepository;
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
@RequestMapping("/api/v1.0/criteres")
@RequiredArgsConstructor
public class CritereController {
    private final PratiqueRepository pratiqueRepository;
    //private final PrincipeRepository principeRepository;
    private final CritereRepository critereRepository;
    private final PrincipeService principeService;

    @GetMapping("/{id}")
    public CritereEntity getCriteresById(@PathVariable Long id) {
        return critereRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Critere not found"));
    }

    @GetMapping
    public ResponseEntity<List<CritereEntity>> getAllCriteres() {
        List<CritereEntity> criteres = principeService.getAllCriteres();
        return ResponseEntity.ok(criteres);
    }

    @PostMapping("/create/{id}")
    public ResponseEntity<PrincipeResponse> createCritere( @PathVariable Long id, @RequestBody PrincipeRequest request) {
        //fetch the parent pratique
        PratiqueEntity pratique =pratiqueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pratique not found"));

        //create new critere
        CritereEntity critere = new CritereEntity();
        critere.setNom(request.getNom());
        critere.setDescription(request.getDescription());
        critere.setPratique(pratique); 

        //save new critere
        critereRepository.save(critere);

        // Prepare response
        PrincipeResponse response = new PrincipeResponse();
        response.setId(critere.getId());
        response.setNom(critere.getNom());
        response.setDescription(critere.getDescription());

        principeService.syncAllEvaluationsScoreMax();

    return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCritere(@PathVariable Long id) {
        principeService.deleteCritere(id);
        principeService.syncAllEvaluationsScoreMax();
    return ResponseEntity.ok("Critere supprimée avec succès");
}

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCritere(@RequestBody CritereEntity critere) {
        principeService.updateCritere(critere);
        principeService.syncAllEvaluationsScoreMax();
        return ResponseEntity.ok("Updated");
}

}
