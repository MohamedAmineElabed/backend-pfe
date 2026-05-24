package com.example.authentify.controller;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.http.ResponseEntity;

//import com.example.authentify.entity.CritereEntity;

//import com.example.authentify.entity.OrganismeEntity;

import com.example.authentify.entity.PrincipeEntity;
//import com.example.authentify.entity.DemandeEntity;
import com.example.authentify.io.PrincipeRequest;
import com.example.authentify.io.PrincipeResponse;
//import com.example.authentify.repository.DemandeRepository;
//import com.example.authentify.service.EmailService;
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
@RequestMapping("/api/v1.0/principes")
@RequiredArgsConstructor
public class PrincipeController {
    private final PrincipeRepository principeRepository;
    private final PrincipeService principeService;

    @GetMapping("/{id}")
    public PrincipeEntity getPrincipeById(@PathVariable Long id) {
        return principeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Principe not found"));
    }

    @GetMapping
    public ResponseEntity<List<PrincipeEntity>> getAllPrincipes() {
        List<PrincipeEntity> principes = principeService.getAllPrincipes();
        return ResponseEntity.ok(principes);
    }

    @PostMapping("/create")
    public ResponseEntity<PrincipeResponse> createPrincipe(@RequestBody PrincipeRequest request) {
        PrincipeResponse response = principeService.createPrincipe(request);
        principeService.syncAllEvaluationsScoreMax();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePrincipe(@PathVariable Long id) {
        principeService.deletePrincipe(id);
        principeService.syncAllEvaluationsScoreMax();
    return ResponseEntity.ok("Principe supprimée avec succès");
}

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePrincipe(@RequestBody PrincipeEntity principe) {
        principeService.updatePrincipe(principe);
        principeService.syncAllEvaluationsScoreMax();
        return ResponseEntity.ok("Updated");
}
}
