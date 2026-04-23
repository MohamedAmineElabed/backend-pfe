package com.example.authentify.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class UpdateReponseRequest {
    private Long critereId;
    private Integer valeur;
    //private String commentaire;
    //private String statut;

}
