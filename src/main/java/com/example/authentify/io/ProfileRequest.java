package com.example.authentify.io;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
//import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ProfileRequest {
    
    @NotBlank(message = "nom is required")
    private String nom;
    
    @NotBlank(message = "prenom is required")
    private String prenom;
    
    @Email(message = "Email should be valid")
    @NotNull(message = "Email is required")
    private String email;

    /*@NotBlank(message = "telephone is required")
    private String telephone;*/
    
    @NotBlank(message = "Organisme is required")
    private String organisme;
    
    
    @NotBlank(message = "Role is required")
    private String role;

    @Size(min = 6, message = "Password should be at least 6 characters long") // Password should be at least 6 characters
    private String password;
    //pour la demande
    private String description;

    // Organisme fields
    @NotBlank(message = "Nom organisme is required")
    private String nomOrganisme;

    private String emailOrganisme;
    private String adresse;
    private String secteur;
    private String fax;
    private String telephoneOrganisme;
    @NotBlank(message = "Type d'organisme is required")
    private String typeOrganisme;


    
}
