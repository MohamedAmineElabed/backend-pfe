package com.example.authentify.io;

import jakarta.validation.constraints.Size;
//import jakarta.validation.constraints.Size;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
public class PasswordRequest {
    private Long userId;
    private String oldPassword;
    @NotBlank(message = "Le mot de passe ne peut pas être vide")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(regexp = ".*[A-Z].*", message = "Le mot de passe doit contenir au moins une majuscule")
    @Pattern(regexp = ".*[a-z].*", message = "Le mot de passe doit contenir au moins une minuscule")
    @Pattern(regexp = ".*\\d.*", message = "Le mot de passe doit contenir au moins un chiffre")
    @Pattern(regexp = ".*[!@#$%^&*()].*", message = "Le mot de passe doit contenir au moins un caractère spécial")
    private String newPassword;

    private String email;

    /*@NotBlank(message = "Le mot de passe ne peut pas être vide")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(regexp = ".*[A-Z].*", message = "Le mot de passe doit contenir au moins une majuscule")
    @Pattern(regexp = ".*[a-z].*", message = "Le mot de passe doit contenir au moins une minuscule")
    @Pattern(regexp = ".*\\d.*", message = "Le mot de passe doit contenir au moins un chiffre")
    @Pattern(regexp = ".*[!@#$%^&*()].*", message = "Le mot de passe doit contenir au moins un caractère spécial")
    private String password;*/
    
    private String otp;

}


