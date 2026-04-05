package com.example.authentify.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.ResponseStatus;

//import com.example.authentify.entity.DemandeEntity;
//import com.example.authentify.entity.DemandeEntity;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.http.ResponseEntity;
//import com.example.authentify.entity.DemandeEntity;
//import com.example.authentify.entity.DemandeEntity;
import com.example.authentify.entity.OrganismeEntity;
//import com.example.authentify.io.DemandeRequest;
import com.example.authentify.io.OrganismeRequest;
//import com.example.authentify.io.ProfileResponse;
import com.example.authentify.io.OrganismeResponse;
//import com.example.authentify.entity.UserEntity;
import com.example.authentify.repository.OrganismeRepository;
//import com.example.authentify.repository.DemandeRepository;
import com.example.authentify.service.ProfileService;
import lombok.RequiredArgsConstructor;
import java.util.List;

//import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/v1.0/organismes")
@RequiredArgsConstructor
public class OrganismeController {

    private final OrganismeRepository organismeRepository;
    private final ProfileService profileService;


    @GetMapping("/{id}")
    public OrganismeEntity getOrganismeById(@PathVariable Long id) {
        return organismeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organisme not found"));
    }

    @GetMapping
    public ResponseEntity<List<OrganismeEntity>> getAllOrganismes() {
        List<OrganismeEntity> organismes = profileService.getAllOrganismes();
        return ResponseEntity.ok(organismes);
    }

    //update organisme
    /*@PutMapping(value="/update/{id}",consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody OrganismeEntity organisme) {
        organisme.setId(id);
        profileService.updateOrganisme(organisme);
        return ResponseEntity.ok("Updated");*/
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateOrganisme(@PathVariable Long id,@RequestBody OrganismeRequest request) {
        profileService.updateOrganisme(id, request);
        return ResponseEntity.ok("Updated");
}


    /*@PostMapping("/registerOrganisme")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganismeEntity registerOrganisme(@RequestBody OrganismeRequest request)  {   // Validate the incoming request using @Valid and @RequestBody annotations
        //ProfileResponse response = demandeService.createDemande(request);
        OrganismeEntity savedorg = savedorg.createOrganisme(request);
        //to do :send welcome email
        return savedorg;
    }*/
   @PostMapping("/createOrganisme")
    public OrganismeResponse addOrganisme(@RequestBody OrganismeRequest request) {
        return profileService.createOrganisme(request);
    }
}
