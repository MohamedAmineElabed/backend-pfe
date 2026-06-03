package com.example.authentify.io;

//import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class UpdateEvaluationRequest {
    private List<UpdateReponseRequest> reponses;

}
