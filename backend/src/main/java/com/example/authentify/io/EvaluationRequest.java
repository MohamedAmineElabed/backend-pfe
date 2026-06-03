package com.example.authentify.io;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class EvaluationRequest {
    @NotNull
    private Long organismeId;
    private List<ReponseRequest> reponses;
    private Long responsableId;

    

}
