package com.example.authentify.io;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PrincipeRequest {
    @NotBlank
    private String nom;

    private String description;

    // to associate pratique with a principe
    private Long principeId;

    // to associate critere with a pratique
    private Long pratiqueId;

}
