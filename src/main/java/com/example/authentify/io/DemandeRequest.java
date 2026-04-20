package com.example.authentify.io;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
//import jakarta.validation.constraints.Size;
//import jakarta.validation.constraints.Size;
//import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DemandeRequest {
    @NotBlank(message = "nom is required")
    private String nom;
    
    @NotBlank(message = "prenom is required")
    private String prenom;
    
    @Email(message = "Email should be valid")
    @NotNull(message = "Email is required")
    private String email;

    @NotBlank(message = "telephone is required")
    private String telephone;
    
    @NotBlank(message = "Organisme is required")
    private String nomOrganisme;
    
    @NotBlank(message = "Type d'organisme is required")
    private String typeOrganisme;
    
    @NotBlank(message = "Role is required")
    private String role;

    //private String description;
    private String jobRole;
    private String adresse;
    private String fax;
    private String emailOrganisme;
    private String secteur;
    @Column(name="date_creation")
    private LocalDate dateCreation;
    
    @Column(name = "logo_url")
    private String logoUrl;


}
