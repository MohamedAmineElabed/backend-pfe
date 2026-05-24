package com.example.authentify.io;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class OrganismeResponse {
     private Long id;
    private String nomOrganisme;
    private String emailOrganisme;
    private String adresse;
    private String secteur;
    private String telephone;
    private String fax;
    private String type;
    private LocalDate dateCreation;
    private String responsable;

}
