package com.example.authentify.io;
//import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReponseRequest {
    private Long critereId;
    private Integer valeur;
    private String commentaire;

}
