package com.example.authentify.controller;

//import com.example.authentify.repository.EvaluationRepository;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.authentify.entity.EvaluationEntity;
import com.example.authentify.entity.OrganismeEntity;
import com.example.authentify.entity.PrincipeEntity;
import com.example.authentify.entity.ReponseEntity;

//import com.example.authentify.entity.OrganismeEntity;

//import com.example.authentify.entity.UserEntity;
import com.example.authentify.io.EvaluationRequest;
//import com.example.authentify.io.ReponseRequest;
//import com.example.authentify.repository.DemandeRepository;
import com.example.authentify.service.PrincipeService;
import com.example.authentify.service.ProfileService;
import com.example.authentify.service.EvaluationServiceImp;
//import java.util.Map;
import java.util.List;
//import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.ResponseStatus;
//import static java.util.Map.entry;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1.0/evaluation")
@RequiredArgsConstructor
public class EvaluationController {
    //private final EvaluationRepository evaluationRepository;
    //private final EvaluationRepository evaluationRepository;
    //private final ReponseRepository reponseRepository;
    private final EvaluationServiceImp evaluationService;
    private final PrincipeService principeService;
    private final ProfileService organismeService;

    /*EvaluationController(EvaluationRepository evaluationRepository) {
        this.evaluationRepository = evaluationRepository;
    }*/

   @PostMapping("/new")
    public ResponseEntity<Long> createEvaluation(@RequestBody EvaluationRequest request) {
        EvaluationEntity evaluation = evaluationService.createEvaluation(request);
        return ResponseEntity.ok(evaluation.getId());
    }

    @GetMapping("/principes")
    public ResponseEntity<List<PrincipeEntity>> getAllPrincipes() {
        List<PrincipeEntity> principes = principeService.getAllPrincipes();
        return ResponseEntity.ok(principes);
    }

    @PostMapping("/reponses/reponse/save/{evaluationId}")
    public ResponseEntity<?> saveReponse(
        @PathVariable Long evaluationId,
        @RequestParam Long critereId,
        @RequestParam Integer valeur,
        @RequestParam(required = true) MultipartFile[] files // optional file
) {
    try {
        ReponseEntity savedEvaluation = evaluationService.saveReponse(evaluationId, critereId, valeur, files);
        return ResponseEntity.ok(savedEvaluation);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
}

    /*@GetMapping
   public ResponseEntity<List<EvaluationEntity>> getEvaluationsByUser(@RequestParam Long userId){
    List<EvaluationEntity> evaluations=evaluationService.getEvaluationsByUserId(userId);
    return ResponseEntity.ok(evaluations);
   }*/

    


    @GetMapping("/organisme/{organismeId}")
    public ResponseEntity<List<EvaluationEntity>> getEvaluationsByOrganisme(@PathVariable Long organismeId) {
        List<EvaluationEntity> evaluations = evaluationService.getEvaluationsByOrganisme(organismeId);
    return ResponseEntity.ok(evaluations);
}
//////////////////////////////////////////////////////////////////////

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getEvaluationsByUser(@RequestParam Long userId){
        List<EvaluationEntity> evaluations = evaluationService.getEvaluationsByUserId(userId);

        List<Map<String, Object>> response = evaluations.stream().map((EvaluationEntity ev) -> {
            //int preuvesCount = ev.getReponses() != null ? ev.getReponses().size() : 0;
            int preuvesCount = 0;
            if (ev.getReponses() != null) {
                preuvesCount = ev.getReponses().stream()
                .mapToInt(r -> r.getPreuves() != null ? r.getPreuves().size() : 0)
                .sum();
        }

            int progress = 0;
            if(ev.getReponses() != null && !ev.getReponses().isEmpty()) {
                int total = ev.getReponses().stream().mapToInt(r -> r.getValeur() != null ? r.getValeur() : 0).sum();
                int max = ev.getReponses().size() * 5; // max value per critere
                progress = (int)((double) total / max * 100);
            }

            String statut = ev.getStatut();
            String dateCreation = ev.getDateSoumission() != null ? ev.getDateSoumission().toLocalDateTime().toLocalDate().toString() : "";
            //String organisme = "Organisme #" + ev.getId();
            Integer score=ev.getScore();
            String label=ev.getLabel();

            // Fetch organisme
            OrganismeEntity org = organismeService.getOrganismeById(ev.getOrganisme().getId());
            String organismeName = org != null ? org.getNomOrganisme() : "_";
            String responsableName = (org != null && org.getResponsable() != null) ? org.getResponsable().getNom() : "_";

            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", ev.getId());
            map.put("organismeId", ev.getId());
            map.put("organismeName", organismeName);
            map.put("responsableName", responsableName);
            map.put("statut", statut);
            map.put("dateCreation", dateCreation);
            map.put("progress", progress);
            map.put("preuves", preuvesCount);
            map.put("score", score);
            map.put("label", label);
            return map;
        }).toList();

    return ResponseEntity.ok(response);
}

    /*@GetMapping
    public List<Map<String, Object>> getEvaluations(@RequestParam Long userId) {
        return evaluationService.getEvaluationsWithOrganismeAndResponsable(userId);
    }*/


    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllEvaluations() {
        List<EvaluationEntity> evaluations = evaluationService.getAllEvaluations();
        List<Map<String, Object>> response = evaluations.stream().map(ev -> {

        int preuvesCount = 0;
        if (ev.getReponses() != null) {
            preuvesCount = ev.getReponses().stream()
                .mapToInt(r -> r.getPreuves() != null ? r.getPreuves().size() : 0)
                .sum();
        }

        int progress = 0;
        if (ev.getReponses() != null && !ev.getReponses().isEmpty()) {
            int total = ev.getReponses().stream()
                .mapToInt(r -> r.getValeur() != null ? r.getValeur() : 0)
                .sum();
            int max = ev.getReponses().size() * 5;
            progress = (int) ((double) total / max * 100);
        }

        OrganismeEntity org = organismeService.getOrganismeById(ev.getOrganisme().getId());

        return Map.<String, Object>of(
            "id", ev.getId(),
            "organismeName", org != null ? org.getNomOrganisme() : "_",
            "responsableName", (org != null && org.getResponsable() != null) ? org.getResponsable().getNom() : "_",
            "status", ev.getStatut(),
            "progress", progress,
            "preuves", preuvesCount
        );

    }).toList();

    return ResponseEntity.ok(response);
}

    /*@GetMapping("/{id}")
    public ResponseEntity<EvaluationEntity> getEvaluationWithResponsesAndPreuves(@PathVariable Long id) {
        EvaluationEntity evaluation = evaluationService.getEvaluationByIdWithResponsesAndPreuves(id);
        return ResponseEntity.ok(evaluation);
}*/

    @GetMapping("/{evaluationId}/reponses")
    public ResponseEntity<EvaluationEntity> getEvaluationResponses(@PathVariable Long evaluationId) {
        EvaluationEntity evaluation = evaluationService.getEvaluationByIdWithResponsesAndPreuves(evaluationId);
        if (evaluation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(evaluation);
}

    @PutMapping("/reponses/{id}/enregistrer")
    public ResponseEntity<String> enregistrerComment(@PathVariable Long id,@RequestBody Map<String, String> body // receive the comment
    ) {
        String comment=body.get("comment");
        evaluationService.enregistrerComment(id,comment);
        return ResponseEntity.ok("reponse with id " + id + " has been validated.");
}

    @PutMapping("/reponses/{id}/valider")
    public ResponseEntity<String> validerCritere(@PathVariable Long id,
                                                @RequestBody Map<String, String> body // receive the comment
    ) {
        String comment=body.get("comment");
        evaluationService.validerReponse(id,comment);
        return ResponseEntity.ok("reponse with id " + id + " has been validated.");
}



    @PutMapping("/reponses/{id}/refuser")
    public ResponseEntity<String> refuserCritere(@PathVariable Long id,@RequestBody Map<String, String> body) {
        String comment=body.get("comment");
        
        evaluationService.refuserReponse(id,comment);
        return ResponseEntity.ok("reponse with id " + id + " has been refused.");
}

    @PutMapping("/{id}/updateStatut")
    public ResponseEntity<String> changerStatut(@PathVariable Long id,@RequestBody Map<String, String> body){
        String newStatut = body.get("statut");
        evaluationService.changerStatut(id, newStatut);
        return ResponseEntity.ok("statut with id " + id + " has been modified.");
}

    @DeleteMapping("{evaluationId}")
    public ResponseEntity<String> deleteEvaluation(@PathVariable Long evaluationId) {
        try{
        evaluationService.deleteEvaluation(evaluationId);
        return ResponseEntity.ok("Evaluation with id " + evaluationId + " has been deleted.");
    }
    catch (Exception e) {
        return ResponseEntity.status(500).body("Error occurred while deleting evaluation.");
    }
}

    @PutMapping("/{evaluationId}/score")
    public ResponseEntity<String> setEvaluationScore(@PathVariable Long evaluationId,@RequestBody Map<String, Object> body) {
        Integer score = null;
        Object scoreObj = body.get("score");

        if (scoreObj != null) {
            if (scoreObj instanceof Number) {
                score = ((Number) scoreObj).intValue();
            } else if (scoreObj instanceof String) {
                score = Integer.parseInt((String) scoreObj);
            }
        }

        if (score == null) {
            return ResponseEntity.badRequest().body("Score is required");
        }

        evaluationService.setScoreForEvaluation(evaluationId, score);
    return ResponseEntity.ok("Score set successfully for evaluation " + evaluationId);
}


    @GetMapping("/all/treated")
    public ResponseEntity<List<Map<String, Object>>> getAllEvaluationsWithTreatedProgress() {
        List<EvaluationEntity> evaluations = evaluationService.getAllEvaluations();

    List<Map<String, Object>> response = evaluations.stream().map(ev -> {

        int totalCriteria = ev.getReponses() != null ? ev.getReponses().size() : 0;

        int treated = 0;
        if (ev.getReponses() != null) {
            treated = (int) ev.getReponses().stream()
                .filter(r -> "validé".equalsIgnoreCase(r.getStatut()) || "refusé".equalsIgnoreCase(r.getStatut())) //avec les boutons valider et refuser
                .count();
        }

        int progression = totalCriteria > 0 ? (int) ((double) treated / totalCriteria * 100) : 0;

        OrganismeEntity org = organismeService.getOrganismeById(ev.getOrganisme().getId());
        

        int totalScore = 0;
        if (ev.getReponses() != null) {
            totalScore = ev.getReponses().stream()
                .filter(r -> "validé".equalsIgnoreCase(r.getStatut()))
                .mapToInt(r -> r.getValeur() != null ? r.getValeur() : 0)
                .sum();
        }
        int maxScore=ev.getScoreMax();
        //int maxScore = ev.getReponses() != null ? ev.getReponses().size() * 3 : 0;
        String label = evaluationService.getLabel(totalScore, maxScore);
        String dateCreation = ev.getDateSoumission() != null ? ev.getDateSoumission().toLocalDateTime().toLocalDate().toString() : "";
        String dateTermination = ev.getDateTermination() != null ? ev.getDateTermination().toLocalDateTime().toLocalDate().toString() : "";

        // Use HashMap instead of Map.ofEntries
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", ev.getId());
        map.put("organismeName", org != null ? org.getNomOrganisme() : "_");
        map.put("organismeType", org != null ? org.getType() : "_");
        map.put("responsableName", (org != null && org.getResponsable() != null) ? org.getResponsable().getNom() : "_");
        map.put("status", ev.getStatut());
        map.put("progression", progression);
        map.put("totalCriteria", totalCriteria);
        map.put("treatedCriteria", treated);
        map.put("score", totalScore);
        map.put("maxScore", maxScore);
        map.put("label", label);
        map.put("dateCreation", dateCreation);
        map.put("dateTermination", dateTermination);
        map.put("scoreMax", maxScore);

        return map;

    }).toList();

    return ResponseEntity.ok(response);
}


    @GetMapping("/latest")
    public ResponseEntity<EvaluationEntity> getLatestEval(@RequestParam Long userId){
        EvaluationEntity latest=evaluationService.getLatestEvaluation(userId);
        if (latest == null) {
            return ResponseEntity.ok().body(null);
        }
        return ResponseEntity.ok(latest);
    }

    


}
