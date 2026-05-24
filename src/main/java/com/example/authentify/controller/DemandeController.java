package com.example.authentify.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
//import org.springframework.beans.factory.annotation.Value;

//import java.nio.file.Files;
//import java.nio.file.Paths;
import java.util.List;
import com.example.authentify.entity.DemandeEntity;
//import com.example.authentify.io.ProfileRequest;
import com.example.authentify.io.DemandeRequest;
import com.example.authentify.service.CloudinaryService;
//import com.example.authentify.io.ProfileResponse;
import com.example.authentify.service.DemandeService;
//import com.example.authentify.service.EmailService;

//import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import java.nio.file.Path;




@RestController
@RequestMapping("/api/v1.0/demandes")
@RequiredArgsConstructor
//@CrossOrigin("*") // Allow requests from any origin (you can specify allowed origins if needed)




public class DemandeController {
    private final DemandeService demandeService;
    //private final EmailService emailService;
    //@Value("${app.base-url}")
    //private String baseUrl;
    private final CloudinaryService cloudinaryService;


    @GetMapping
    public ResponseEntity<List<DemandeEntity>> getAllDemandes() {
        List<DemandeEntity> demandes = demandeService.getAllDemandes();
        return ResponseEntity.ok(demandes);
    }

    @PostMapping("/registerDemande")
    @ResponseStatus(HttpStatus.CREATED)
    public DemandeEntity registerDemande(@ModelAttribute DemandeRequest request,
                                    @RequestParam(value = "logo", required = false) MultipartFile logo) {

        String logoUrl = null;
        if (logo != null && !logo.isEmpty()) {
            try {
                /*String fileName = System.currentTimeMillis() + "_" + logo.getOriginalFilename();

                Path uploadPath = Paths.get("uploads/");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(fileName);
                Files.write(filePath, logo.getBytes());

                //URL to save in DB
                //logoUrl = baseUrl + "/api/v1.0/files/" + fileName;
                logoUrl = "http://localhost:8080/api/v1.0/uploads/" + fileName;*/
                logoUrl = cloudinaryService.uploadLogo(logo);

            } catch (Exception e) {
            throw new RuntimeException("Error uploading logo");
            }
        }

    // inject logoUrl into request
    request.setLogoUrl(logoUrl);

    return demandeService.createDemande(request);
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
