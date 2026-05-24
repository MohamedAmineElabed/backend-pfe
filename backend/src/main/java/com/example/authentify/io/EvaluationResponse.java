package com.example.authentify.io;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor; 
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationResponse {
    private Long id;
    private String statut;
    private List<ReponseResponse> reponses;



}
