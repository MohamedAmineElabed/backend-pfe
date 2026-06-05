package com.example.authentify.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class ProfileResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String addresseResp;
    private String role;
    private OrganismeResponse organisme;
    private String token;
    

}
