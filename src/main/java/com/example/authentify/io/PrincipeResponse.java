package com.example.authentify.io;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor; 

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PrincipeResponse {
    private Long id;
    private String nom;
    private String description;

    // to associate pratique with a principe
    private Long principeId;

    // to associate critere with a pratique
    private Long pratiqueId;

}
