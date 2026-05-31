package com.example.authentify.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.authentify.entity.ReponseEntity;
//import com.example.authentify.entity.ScoreParPrincipeEntity;
import com.example.authentify.entity.CritereEntity;
import com.example.authentify.entity.EvaluationEntity;
import com.example.authentify.entity.OrganismeEntity;
import com.example.authentify.entity.PreuveEntity;
import com.example.authentify.io.EvaluationRequest;
import com.example.authentify.io.UpdateEvaluationRequest;
import com.example.authentify.io.UpdateReponseRequest;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Objects;
import java.lang.Long;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.nio.file.Path;

import com.example.authentify.repository.EvaluationRepository;
import com.example.authentify.repository.OrganismeRepository;
import com.example.authentify.repository.ReponseRepository;
import com.example.authentify.repository.PreuveRepository;
import com.example.authentify.repository.CritereRepository;
import com.example.authentify.repository.PrincipeRepository;
import com.example.authentify.repository.ScoreParPrincipeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImp {

    private final EvaluationRepository evaluationRepository;
    private final ReponseRepository reponseRepository;
    private final PreuveRepository preuveRepository;
    private final OrganismeRepository organismeRepository;
    private final CritereRepository critereRepository;
    private final ScoreParPrincipeRepository scoreParPrincipeRepository;
    //private final PrincipeRepository principeRepository;
    private final ScoreParPrincipeService scoreParPrincipeService;

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    public int calculerMaxScore() {
        List<CritereEntity> allCriteres = critereRepository.findAll();
        return allCriteres.size() * 3;
    }

    public String getLabel(int score, int maxscore) {
        if (maxscore == 0) return "Non évalué";
        double pct = (double) score / maxscore * 100;
        if (pct < 40)       return "Non conforme";
        else if (pct <= 59) return "Bronze";
        else if (pct <= 79) return "Argent";
        else if (pct <= 89) return "Or";
        else return "Excellence governance";
    }

    // ─────────────────────────────────────────────────────────────
    // CREATE EVALUATION
    // ─────────────────────────────────────────────────────────────

    public EvaluationEntity createEvaluation(EvaluationRequest request) {
        OrganismeEntity organisme = organismeRepository.findById(request.getOrganismeId())
            .orElseThrow(() -> new RuntimeException("Organisme not found with id: " + request.getOrganismeId()));

        EvaluationEntity evaluation = EvaluationEntity.builder()
            .organisme(organisme)
            .responsableId(request.getResponsableId())
            .statut("en attente")
            .score(0)
            .scoreMax(calculerMaxScore())
            .annee(LocalDate.now().getYear())
            .build();

        return evaluationRepository.save(evaluation);
    }

    // ─────────────────────────────────────────────────────────────
    // SAVE RESPONSE (called per critère from the form)
    // ─────────────────────────────────────────────────────────────

    public ReponseEntity saveReponse(Long evaluationId, Long critereId, Integer valeur, MultipartFile[] files) throws IOException {

        // 1. Load evaluation
        EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

        // 2. Upsert the response
        ReponseEntity reponse = reponseRepository.findByEvaluationIdAndCritereId(evaluationId, critereId)
            .orElse(new ReponseEntity());

        reponse.setEvaluation(evaluation);
        reponse.setCritereId(critereId);

        Integer oldValeur = reponse.getValeur();
        reponse.setValeur(valeur);

        // Determine if we switched between low-level (0/1) and high-level (2/3) values
        boolean switchedToLowLevel = valeur != null && (valeur == 0 || valeur == 1);
        boolean switchedToHighLevel = valeur != null && (valeur == 2 || valeur == 3);
        boolean wasHighLevel = oldValeur != null && (oldValeur == 2 || oldValeur == 3);
        boolean evaluationWasTerminee = "terminé".equals(evaluation.getStatut());

        if (switchedToLowLevel) {
            reponse.setStatut("validé");

            // Delete old preuves when downgrading 2/3 → 0/1
            if (wasHighLevel && reponse.getId() != null) {
                List<PreuveEntity> oldPreuves = preuveRepository.findByReponseId(reponse.getId());
                for (PreuveEntity oldPreuve : oldPreuves) {
                    try {
                        Path oldPath = Paths.get(oldPreuve.getCheminFichier());
                        if (Files.exists(oldPath)) Files.delete(oldPath);
                    } catch (IOException ignored) {}
                }
                preuveRepository.deleteAll(oldPreuves);
            }
        } else {
            reponse.setStatut(null);
        }

        // 3. Persist the response
        reponse = reponseRepository.save(reponse);

        // 4. Persist new files (only for réalisé/validé — values 2 or 3)
        if (switchedToHighLevel && files != null && files.length > 0) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    String uploadDir = "uploads/";
                    Path filePath = Paths.get(uploadDir + file.getOriginalFilename());
                    Files.createDirectories(filePath.getParent());
                    Files.write(filePath, file.getBytes());

                    PreuveEntity preuve = PreuveEntity.builder()
                        .nomFichier(file.getOriginalFilename())
                        .typeFichier(file.getContentType())
                        .tailleFichier((int) file.getSize())
                        .cheminFichier(filePath.toString())
                        .reponse(reponse)
                        .build();
                    preuveRepository.save(preuve);
                }
            }
        }

        // 5. Recompute evaluation score / label / statut
        List<ReponseEntity> allReponses = reponseRepository.findByEvaluationId(evaluationId);

        int score = allReponses.stream()
            .filter(r -> "validé".equals(r.getStatut()) && r.getValeur() != null)
            .mapToInt(ReponseEntity::getValeur)
            .sum();

        int maxScore = calculerMaxScore();

        long pendingCount = allReponses.stream()
            .filter(r -> r.getValeur() != null)
            .filter(r -> r.getStatut() == null)
            .count();

        long answeredCount = allReponses.stream()
            .filter(r -> r.getValeur() != null)
            .count();


// CASE 1: Responsable modified a finished evaluation from 0/1 -> 2/3
if (evaluationWasTerminee && switchedToHighLevel) {
    evaluation.setStatut("en cours");
    evaluation.setScore(0);
    evaluation.setLabel(null);
}

// CASE 2: First submission and ALL responses pending review
else if (pendingCount == answeredCount && pendingCount > 0) {
    evaluation.setStatut("en attente");
    evaluation.setScore(0);
    evaluation.setLabel(null);
}

// CASE 3: Some reviewed, some pending
else if (pendingCount > 0) {
    evaluation.setStatut("en cours");
    evaluation.setScore(0);
    evaluation.setLabel(null);
}

// CASE 4: Everything reviewed
else {
    evaluation.setStatut("terminé");
    evaluation.setScore(score);
    evaluation.setScoreMax(maxScore);
    evaluation.setLabel(getLabel(score, maxScore));
    evaluation.setDateTermination(new Timestamp(System.currentTimeMillis()));
    
}
    // Update score par principe
   // scoreParPrincipeService.UpdateScoreParPrincipe(evaluationId, evaluation);

evaluationRepository.save(evaluation);
        return reponse;
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE EVALUATION (bulk update from évaluateur)
    // ─────────────────────────────────────────────────────────────

    public EvaluationEntity updateEvaluation(Long evaluationId, UpdateEvaluationRequest request) {
        EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

        List<ReponseEntity> existingResponses = reponseRepository.findByEvaluationId(evaluationId);
        Map<Long, ReponseEntity> responseMap = existingResponses.stream()
            .collect(Collectors.toMap(ReponseEntity::getCritereId, r -> r));

        List<ReponseEntity> toSave = new ArrayList<>();

        for (UpdateReponseRequest r : request.getReponses()) {
            if (r.getCritereId() == null) continue;
            //Looks up an existing response for this critereId in the map. If none exists, it creates a new ReponseEntity
            ReponseEntity reponse = responseMap.getOrDefault(r.getCritereId(), new ReponseEntity());
            if (reponse.getId() == null) {
                reponse.setEvaluation(evaluation);
                reponse.setCritereId(r.getCritereId());
            }

            if (r.getValeur() != null) {
                Integer oldValue = reponse.getValeur();
                reponse.setValeur(r.getValeur());
                if (oldValue == null || !oldValue.equals(r.getValeur())) {
                    reponse.setStatut(r.getValeur() == 0 || r.getValeur() == 1 ? "validé" : null);
                }
            }

            toSave.add(reponse);
        }

        // Save ALL responses at once AFTER the loop, then update statut once
        reponseRepository.saveAll(toSave);
        // Update score par principe
        scoreParPrincipeService.UpdateScoreParPrincipe(evaluationId, evaluation);

        updateEvalStatut(evaluationId);

        // Re-fetch so we return the updated statut/score/label
        EvaluationEntity updated = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found"));
        updated.setDateUpdate(new Timestamp(System.currentTimeMillis()));
        return evaluationRepository.save(updated);
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE EVAL STATUT (used by updateEvaluation / évaluateur flow)
    // ─────────────────────────────────────────────────────────────

    /*private void updateEvalStatut(Long evaluationId) {
        EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

        List<ReponseEntity> reponses = reponseRepository.findByEvaluationId(evaluationId);

        if (reponses.isEmpty()) {
            evaluation.setStatut("en attente");
            evaluationRepository.save(evaluation);
            return;
        }

        List<ReponseEntity> answered = reponses.stream()
            .filter(r -> r.getValeur() != null)
            .collect(Collectors.toList());

        if (answered.isEmpty()) {
            evaluation.setStatut("en attente");
            evaluationRepository.save(evaluation);
            return;
        }

        boolean allLowLevel = answered.stream()
            .allMatch(r -> r.getValeur() == 0 || r.getValeur() == 1);

        if (allLowLevel) {
            int score    = answered.stream().mapToInt(ReponseEntity::getValeur).sum();
            int maxScore = calculerMaxScore();
            evaluation.setScore(score);
            evaluation.setScoreMax(maxScore);
            evaluation.setLabel(getLabel(score, maxScore));
            evaluation.setStatut("terminé");
            evaluation.setDateTermination(new Timestamp(System.currentTimeMillis()));
        } else {
            evaluation.setStatut("en cours");
            evaluation.setScore(0);
            evaluation.setLabel(null);
        }

        evaluationRepository.save(evaluation);
    }*/

    private void updateEvalStatut(Long evaluationId) {

    EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
        .orElseThrow(() ->
            new RuntimeException(
                "Evaluation not found with id: " + evaluationId
            )
        );

    List<ReponseEntity> reponses =
        reponseRepository.findByEvaluationId(evaluationId);

    if (reponses.isEmpty()) {

        evaluation.setStatut("en attente");
        evaluationRepository.save(evaluation);
        return;
    }

    List<ReponseEntity> answered = reponses.stream()
        .filter(r -> r.getValeur() != null)
        .collect(Collectors.toList());

    if (answered.isEmpty()) {

        evaluation.setStatut("en attente");
        evaluationRepository.save(evaluation);
        return;
    }

    // ONLY responses with statut NULL require evaluator review
    boolean hasPendingValidation = answered.stream()
        .anyMatch(r -> r.getStatut() == null);

    if (hasPendingValidation) {

        evaluation.setStatut("en cours");
        evaluation.setScore(0);
        evaluation.setLabel(null);

    } else {

        int score = answered.stream()
            .mapToInt(ReponseEntity::getValeur)
            .sum();

        int maxScore = calculerMaxScore();

        evaluation.setScore(score);
        evaluation.setScoreMax(maxScore);
        evaluation.setLabel(getLabel(score, maxScore));
        evaluation.setStatut("terminé");

        evaluation.setDateTermination(
            new Timestamp(System.currentTimeMillis())
        );
    }

    evaluationRepository.save(evaluation);
}

    // ─────────────────────────────────────────────────────────────
    // SCORE (set manually by évaluateur after validating proofs)
    // ─────────────────────────────────────────────────────────────

    public EvaluationEntity setScoreForEvaluation(Long evaluationId, Integer score) {
        EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

        int maxScore = scoreParPrincipeRepository.findByEvaluation_Id(evaluationId)
            .stream().mapToInt(sp -> sp.getScoreMax() != null ? sp.getScoreMax() : 0).sum();
        if (maxScore == 0) maxScore = calculerMaxScore();

        evaluation.setScore(score);
        evaluation.setScoreMax(maxScore);
        evaluation.setLabel(getLabel(score, maxScore));
        return evaluationRepository.save(evaluation);
    }

    public EvaluationEntity updateLabel(Long evaluationId) {
        EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

        if (evaluation.getScore() == null || evaluation.getScoreMax() == null)
            throw new RuntimeException("Score or maxScore is missing");

        evaluation.setLabel(getLabel(evaluation.getScore(), evaluation.getScoreMax()));
        return evaluationRepository.save(evaluation);
    }

    // ─────────────────────────────────────────────────────────────
    // RESPONSE ACTIONS (évaluateur: valider / refuser / comment)
    // ─────────────────────────────────────────────────────────────

    public ReponseEntity validerReponse(Long id, String comment) {
        ReponseEntity reponse = reponseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("reponse not found with id: " + id));
        reponse.setStatut("validé");
        if (comment != null && !comment.isEmpty()) reponse.setCommentaire(comment);
        return reponseRepository.save(reponse);
    }

    public ReponseEntity refuserReponse(Long id, String comment) {
        ReponseEntity reponse = reponseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("reponse not found with id: " + id));
        reponse.setStatut("refusé");
        if (comment != null && !comment.isEmpty()) reponse.setCommentaire(comment);
        return reponseRepository.save(reponse);
    }

    public ReponseEntity enregistrerComment(Long id, String comment) {
        ReponseEntity reponse = reponseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("reponse not found with id: " + id));
        if (comment != null && !comment.isEmpty()) reponse.setCommentaire(comment);
        return reponseRepository.save(reponse);
    }

    // ─────────────────────────────────────────────────────────────
    // STATUT OVERRIDE
    // ─────────────────────────────────────────────────────────────

    public void changerStatut(Long evaluationId, String newStatut) {
        EvaluationEntity eval = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation introuvable"));
        eval.setStatut(newStatut);
        if ("terminé".equalsIgnoreCase(newStatut))
            eval.setDateTermination(new Timestamp(System.currentTimeMillis()));
        evaluationRepository.save(eval);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────

    public void deleteEvaluation(Long evaluationId) throws IOException {
        EvaluationEntity evaluation = evaluationRepository.findById(evaluationId)
            .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));

        List<ReponseEntity> reponses = reponseRepository.findByEvaluationId(evaluationId);
        for (ReponseEntity reponse : reponses) {
            List<PreuveEntity> preuves = preuveRepository.findByReponseId(reponse.getId());
            for (PreuveEntity preuve : preuves) {
                Path filePath = Paths.get(preuve.getCheminFichier());
                if (Files.exists(filePath)) Files.delete(filePath);
            }
            preuveRepository.deleteAll(preuves);
        }
        reponseRepository.deleteAll(reponses);
        evaluationRepository.delete(evaluation);
    }

    // ─────────────────────────────────────────────────────────────
    // QUERIES
    // ─────────────────────────────────────────────────────────────

    public List<EvaluationEntity> getEvaluationsByOrganisme(Long organismeId) {
        return evaluationRepository.findByOrganismeId(organismeId);
    }

    public List<EvaluationEntity> getEvaluationsByOrganismeByAnnee(Long organismeId, Integer annee) {
        return evaluationRepository.findByOrganismeIdAndAnnee(organismeId, annee);
    }

    public List<EvaluationEntity> getEvaluationsByUserId(Long userId) {
        return evaluationRepository.findByUserIdWithReponses(userId);
    }

    public List<EvaluationEntity> getAllEvaluations() {
        return evaluationRepository.findAllActive();
    }

    public EvaluationEntity getEvaluationByIdWithResponsesAndPreuves(Long evaluationId) {
        EvaluationEntity evaluation = evaluationRepository.findById(evaluationId).orElse(null);
        if (evaluation != null) {
            List<ReponseEntity> reponses = reponseRepository.findByEvaluationId(evaluationId);
            for (ReponseEntity reponse : reponses) {
                reponse.setPreuves(preuveRepository.findByReponseId(reponse.getId()));
            }
            evaluation.setReponses(reponses);
        }
        return evaluation;
    }

    public EvaluationEntity getLatestEvaluation(Long organismeId) {
        return evaluationRepository.findLatestEval(organismeId).orElse(null);
    }

    public List<EvaluationEntity> getLatestTreatedPerOrganisme() {
        return evaluationRepository.findAll().stream()
            .filter(e -> "terminé".equals(e.getStatut()))
            .collect(Collectors.toMap(
                e -> e.getOrganisme().getId(),
                e -> e,
                (existing, newer) -> newer.getDateTermination().after(existing.getDateTermination()) ? newer : existing
            ))
            .values().stream().toList();
    }

    public List<EvaluationEntity> getAllEvaluationsByAnnee(int annee) {
        return evaluationRepository.findAll().stream()
            .filter(e -> Objects.equals(e.getAnnee(), annee))
            .collect(Collectors.toList());
    }

    public List<EvaluationEntity> getLatestTreatedPerOrganismeByAnnee(int annee) {
        Map<Long, EvaluationEntity> latestPerOrg = new HashMap<>();
        evaluationRepository.findAllTermineesByAnnee(annee).forEach(e -> {
            Long orgId = e.getOrganisme().getId();
            latestPerOrg.merge(orgId, e, (existing, incoming) -> {
                Timestamp a = existing.getDateTermination();
                Timestamp b = incoming.getDateTermination();
                return (b != null && (a == null || b.after(a))) ? incoming : existing;
            });
        });
        return new ArrayList<>(latestPerOrg.values());
    }



    ///////////////////test personnel
    public List<EvaluationEntity> getOrganismeWithNoEvaluation() {
        List<Long> evaluationsIds=evaluationRepository.findAll().stream().map(e->e.getOrganisme().getId()).toList();
        List<EvaluationEntity> organismesWithNoEvaluations = new ArrayList<>();
        List<OrganismeEntity> allOrganismes = organismeRepository.findAll();
        for (OrganismeEntity org : allOrganismes) {
            if (!evaluationsIds.contains(org.getId())) {
                EvaluationEntity dummyEval = new EvaluationEntity();
                dummyEval.setOrganisme(org);
                organismesWithNoEvaluations.add(dummyEval);
            }
        }
        return organismesWithNoEvaluations;
    }

    public int countEvaluationsByOrganisme(Long organismeId) {
        List<EvaluationEntity> evaluations = evaluationRepository.findByOrganismeId(organismeId);
        return evaluations.size();
    }

}