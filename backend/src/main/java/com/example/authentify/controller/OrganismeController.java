package com.example.authentify.controller;

import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestMapping;

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

//import java.nio.file.Files;
//import java.nio.file.Paths;
import java.util.List;

//import org.springframework.http.HttpStatus;
//import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.http.MediaType;

//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.nio.file.Files;

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
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateOrganisme(@PathVariable Long id,
        //@RequestBody OrganismeRequest request
        @ModelAttribute OrganismeRequest request   // <-- Use ModelAttribute for file upload
        ) {
            try{
        profileService.updateOrganisme(id, request);
        return ResponseEntity.ok("Updated");
            }catch(RuntimeException e){
                return ResponseEntity.badRequest().body(e.getMessage());
            }
}

   @PostMapping("/createOrganisme")
    public OrganismeResponse addOrganisme(@RequestBody OrganismeRequest request) {
        return profileService.createOrganisme(request);
    }


    /*@PostMapping("/uploadLogo/{id}")
    public ResponseEntity<?> uploadLogo(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            String uploadDir = "uploads/";

            Path path = Paths.get(uploadDir + fileName);
            Files.write(path, file.getBytes());

            OrganismeEntity org = organismeRepository.findById(id).orElseThrow();
            org.setLogoUrl(fileName);
            organismeRepository.save(org);

        return ResponseEntity.ok("Logo uploaded");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading logo");
    }
}*/
}
