package com.example.authentify.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

//import org.springframework.web.bind.annotation.PathVariable;
//import java.util.Optional;
//import java.util.List;
//import com.example.authentify.entity.DemandeEntity;
import com.example.authentify.entity.ReponseEntity;
//import com.example.authentify.entity.CritereEntity;
//import com.example.authentify.entity.DemandeEntity;
import com.example.authentify.entity.EvaluationEntity;
import com.example.authentify.entity.OrganismeEntity;
import com.example.authentify.entity.PreuveEntity;
import com.example.authentify.io.EvaluationRequest;
//import com.example.authentify.entity.OrganismeEntity;

//import com.example.authentify.io.ReponseRequest;
import java.sql.Timestamp;
import java.io.IOException;
//import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

//import com.example.authentify.io.OrganismeRequest;

//import com.example.authentify.io.ProfileResponse;
//import com.example.authentify.repository.DemandeRepository;
//import com.example.authentify.repository.UserRepository;

//import com.example.authentify.repository.OrganismeRepository;
//import java.lang.Long;
import java.util.List;
import com.example.authentify.repository.EvaluationRepository;
import com.example.authentify.repository.OrganismeRepository;
import com.example.authentify.repository.ReponseRepository;
import com.example.authentify.repository.PreuveRepository;

import lombok.RequiredArgsConstructor;

//import java.nio.file.Files;
import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.io.IOException;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImp {
    private final EvaluationRepository evaluationRepository;
    private final ReponseRepository reponseRepository;
    private final PreuveRepository preuveRepository;
    private final OrganismeRepository organismeRepository;  
    //private final CritereRepository critereRepository;


    public EvaluationEntity createEvaluation(EvaluationRequest request) {
        // Create evaluation
        EvaluationEntity evaluation = new EvaluationEntity();
        // Fetch the organisme entity first (you need an OrganismeRepository)
        OrganismeEntity organisme = organismeRepository.findById(request.getOrganismeId())
            .orElseThrow(() -> new RuntimeException("Organisme not found with id: " + request.getOrganismeId()));
        evaluation.setOrganisme(organisme);
        evaluation.setResponsableId(request.getResponsableId());
        evaluation.setStatut("en attente");
        evaluation.setScore(0);
        evaluation.setScoreMax(0);

        evaluation = evaluationRepository.save(evaluation);
        return evaluation; // return the entity so frontend can get its ID

        // Save responses
       /*  for (ReponseRequest r : request.getReponses()) {

            ReponseEntity reponse = new ReponseEntity();
            reponse.setCritereId(r.getCritereId());
            reponse.setValeur(r.getValeur());
            reponse.setCommentaire(r.getCommentaire());
            reponse.setEvaluation(evaluation);

            reponseRepository.save(reponse);
        }*/
    }

    public List<EvaluationEntity> getEvaluationsByOrganisme(Long organismeId) {
        return evaluationRepository.findByOrganismeId(organismeId);
    }

    /*public ReponseEntity saveReponse(ReponseRequest request, Long evaluationId) {
    // Chercher l'évaluation
    EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

    // Vérifier si une réponse existe déjà pour ce critère
    ReponseEntity reponse = reponseRepository
        .findByEvaluationIdAndCritereId(evaluationId, request.getCritereId())
        .orElse(new ReponseEntity());

    reponse.setEvaluation(evaluation);
    reponse.setCritereId(request.getCritereId());
    reponse.setValeur(request.getValeur());
    
    //reponse.setCommentaire(request.getCommentaire() != null ? request.getCommentaire() : "");

    return reponseRepository.save(reponse);
}*/

public ReponseEntity saveReponse(Long evaluationId, Long critereId, Integer valeur, MultipartFile[] files) throws IOException {

    // 1. Find the evaluation
    EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

    // 2. Check if response already exists
    ReponseEntity reponse = reponseRepository
            .findByEvaluationIdAndCritereId(evaluationId, critereId)
            .orElse(new ReponseEntity());

    reponse.setEvaluation(evaluation);
    reponse.setCritereId(critereId);
    reponse.setValeur(valeur);
    

    // 3. Save response first (so we have an ID for the file)
    reponse = reponseRepository.save(reponse);

    // 4. Save file if exists
    if (files != null && files.length > 0) {
        for (MultipartFile file : files) {
        if (file != null && !file.isEmpty()) {
        // Example: store in local folder "uploads"
        String uploadDir = "uploads/";
        Path filePath = Paths.get(uploadDir + file.getOriginalFilename());
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, file.getBytes());

        // Save metadata in PreuveEntity
        PreuveEntity preuve = PreuveEntity.builder()
                .nomFichier(file.getOriginalFilename())
                .typeFichier(file.getContentType())
                .tailleFichier((int) file.getSize())
                .cheminFichier(filePath.toString())
                .reponse(reponse)
                .build();

        // Save the PreuveEntity
        // Make sure you have a PreuveRepository injected
        preuveRepository.save(preuve);
    }}}

    return reponse;
}

    public List<EvaluationEntity> getEvaluationsByUserId(Long userId) {
        return evaluationRepository.findByUserIdWithReponses(userId);
}

    public List<EvaluationEntity> getAllEvaluations() {
    return evaluationRepository.findAll();
}

    public EvaluationEntity getEvaluationByIdWithResponsesAndPreuves(Long evaluationId) {
    EvaluationEntity evaluation = evaluationRepository.findById(evaluationId).orElse(null);
    if (evaluation != null) {
        List<ReponseEntity> reponses = reponseRepository.findByEvaluationId(evaluationId);
        for (ReponseEntity reponse : reponses) {
            List<PreuveEntity> preuves = preuveRepository.findByReponseId(reponse.getId());
            reponse.setPreuves(preuves);
        }
        evaluation.setReponses(reponses);
    }
    return evaluation;
}



    public ReponseEntity enregistrerComment(Long id,String comment) {
        ReponseEntity reponse = reponseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("reponse not found with id: " + id));
        //reponse.setStatut("validé");
        if (comment != null && !comment.isEmpty()) {
            reponse.setCommentaire(comment); // save the comment
    }
        ReponseEntity savedComment= reponseRepository.save(reponse);

    
    return savedComment;
}

    public ReponseEntity validerReponse(Long id,String comment) {
        ReponseEntity reponse = reponseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("reponse not found with id: " + id));
        reponse.setStatut("validé");
        if (comment != null && !comment.isEmpty()) {
            reponse.setCommentaire(comment); // save the comment
    }
        ReponseEntity savedReponse= reponseRepository.save(reponse);

    
    return savedReponse;
}    
 

    public ReponseEntity refuserReponse(Long id,String comment) {
        ReponseEntity reponse = reponseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("reponse not found with id: " + id));
        reponse.setStatut("refusé");
        if (comment != null && !comment.isEmpty()) {
            reponse.setCommentaire(comment); // save the comment
    }
        ReponseEntity savedReponse= reponseRepository.save(reponse);

    
    return savedReponse;
}

    public void changerStatut(Long evaluationId, String newStatut) {
    EvaluationEntity eval = evaluationRepository.findById(evaluationId)
        .orElseThrow(() -> new RuntimeException("Evaluation introuvable"));
    eval.setStatut(newStatut);
    if("terminé".equalsIgnoreCase(newStatut)){
        eval.setDateTermination(new Timestamp(System.currentTimeMillis()));

    }
    evaluationRepository.save(eval);
}

    public void deleteEvaluation(Long evaluationId) throws IOException {
    EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));
    //Get all responses linked to this evaluation
    List<ReponseEntity> reponses = reponseRepository.findByEvaluationId(evaluationId);
    for (ReponseEntity reponse : reponses) {
        // 3. Get all proofs linked to this response
        List<PreuveEntity> preuves = preuveRepository.findByReponseId(reponse.getId());
        for (PreuveEntity preuve : preuves) {
            Path filePath = Paths.get(preuve.getCheminFichier());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        }
        //Delete all proofs from DB
        preuveRepository.deleteAll(preuves);
    }

    //Delete all responses from DB
    reponseRepository.deleteAll(reponses);

    //Delete the evaluation itself
    evaluationRepository.delete(evaluation);
}

    public EvaluationEntity setScoreForEvaluation(Long evaluationId, Integer score) {
    EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

    evaluation.setScore(score); // set total score here

    // Calculate max score (sum of all criteria max values)
    int maxScore = evaluation.getReponses() != null ? evaluation.getReponses().size() * 3 : 0;
    evaluation.setScoreMax(maxScore);
    String label = getLabel(score, maxScore);
    evaluation.setLabel(label);
    return evaluationRepository.save(evaluation);
}

public String getLabel(int score,int maxscore){
    if(maxscore==0) return "Non évalué";
    double pct=(double)score/maxscore*100;
    if(pct<40) return "Non conforme";
    else if(pct>=40 && pct<=59) return "Bronze";
    else if(pct>=60 && pct<=79) return "Argent";
    else if(pct>=80 && pct<=89) return "Or";
    else return "Excellence governance";
}

public EvaluationEntity getLatestEvaluation(Long userId){
    return evaluationRepository.findLatestEval(userId).orElse(null);
}
}
