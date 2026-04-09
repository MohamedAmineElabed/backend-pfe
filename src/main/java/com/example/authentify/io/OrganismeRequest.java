package com.example.authentify.io;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

//import jakarta.validation.constraints.Size;
//import jakarta.validation.constraints.Size;
//import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


//import java.time.LocalDate;

//import jakarta.persistence.Column;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganismeRequest {
    @NotBlank(message = "nom is required")
    private String nomOrganisme;
    
    @Email(message = "Email should be valid")
    @NotNull(message = "Email is required")
    private String emailOrganisme;

    @NotBlank(message = "telephone is required")
    private String telephone;
    
    @NotBlank(message = "Type d'organisme is required")
    private String type;
    
    
    private String description;
    private String adresse;
    private String fax;
    //private String emailOrganisme;
    private String secteur;
    @Column(name="date_creation")
    private LocalDate dateCreation;
    
    @Column(name = "logo_url")
    private String logoUrl;

    private MultipartFile logo;

}
