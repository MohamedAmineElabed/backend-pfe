package com.example.authentify.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import com.example.authentify.entity.DemandeEntity;
//import com.example.authentify.io.ProfileRequest;
import com.example.authentify.io.DemandeRequest;
//import com.example.authentify.io.ProfileResponse;
import com.example.authentify.service.DemandeService;
//import com.example.authentify.service.EmailService;

//import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api/v1.0/demandes")
@RequiredArgsConstructor
@CrossOrigin("*") // Allow requests from any origin (you can specify allowed origins if needed)




public class DemandeController {
    private final DemandeService demandeService;
    //private final EmailService emailService;

    @GetMapping
    public ResponseEntity<List<DemandeEntity>> getAllDemandes() {
        List<DemandeEntity> demandes = demandeService.getAllDemandes();
        return ResponseEntity.ok(demandes);
    }
    
    @PostMapping("/registerDemande")
    @ResponseStatus(HttpStatus.CREATED)
    public DemandeEntity registerDemande(@RequestBody DemandeRequest request)  {   // Validate the incoming request using @Valid and @RequestBody annotations
        //ProfileResponse response = demandeService.createDemande(request);
        DemandeEntity savedDemande = demandeService.createDemande(request);
        //to do :send welcome email
        return savedDemande;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDemande(@PathVariable Long id) {
        demandeService.deleteDemande(id);
    return ResponseEntity.ok("Demande supprimée avec succès");
}

    @PutMapping("/{id}/valider")
    public ResponseEntity<String> validerDemande(@PathVariable Long id) {
        demandeService.validerDemande(id);
        return ResponseEntity.ok("Demande with id " + id + " has been validated.");
}
    @PutMapping("/{id}/refuser")
    public ResponseEntity<String> refuserDemande(@PathVariable Long id) {
        demandeService.refuserDemande(id);
        return ResponseEntity.ok("Demande with id " + id + " has been refused.");
    }
    

}
