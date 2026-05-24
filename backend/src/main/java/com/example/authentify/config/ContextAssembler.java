package com.example.authentify.config;

//package com.example.authentify.service;

import com.example.authentify.entity.*;
import com.example.authentify.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.stream.Collectors;

import java.util.List;

@Service
public class ContextAssembler {

    @Autowired private PrincipeRepository principeRepo;
    @Autowired private CritereRepository critereRepo;

    private String mapValeur(Integer valeur) {
        if (valeur == null) return "non renseigné";
        return switch (valeur) {
            case 0  -> "n'existe pas";
            case 1  -> "en cours";
            case 2  -> "réalisé";
            case 3  -> "validé";
            default -> "inconnu (" + valeur + ")";
        };
    }

    public String assemble(EvaluationEntity evaluation) {

        //ONE query — load all criteres for this evaluation upfront
        List<Long> critereIds = evaluation.getReponses()
            .stream()
            .map(ReponseEntity::getCritereId)
            .toList();

        Map<Long, CritereEntity> critereMap = critereRepo
            .findAllById(critereIds)
            .stream()
            .collect(Collectors.toMap(CritereEntity::getId, c -> c));

        //ONE query — load all principes upfront
        List<Long> principeIds = evaluation.getScoresParPrincipe()
            .stream()
            .map(ScoreParPrincipeEntity::getPrincipeId)
            .toList();

        Map<Long, PrincipeEntity> principeMap = principeRepo
            .findAllById(principeIds)
            .stream()
            .collect(Collectors.toMap(PrincipeEntity::getId, p -> p));

        // --- Build context string ---
        StringBuilder ctx = new StringBuilder();

        ctx.append("Organisme : ").append(evaluation.getOrganisme().getNomOrganisme()).append("\n");
        ctx.append("Statut    : ").append(evaluation.getStatut()).append("\n");
        ctx.append("Label     : ").append(evaluation.getLabel()).append("\n\n");

        for (ScoreParPrincipeEntity spp : evaluation.getScoresParPrincipe()) {

            PrincipeEntity principe = principeMap.get(spp.getPrincipeId());
            String nomPrincipe = (principe != null)
                ? principe.getNom()
                : "Principe #" + spp.getPrincipeId();

            int pct = (spp.getScoreMax() != null && spp.getScoreMax() > 0)
                ? (spp.getScore() * 100) / spp.getScoreMax()
                : 0;

            ctx.append("PRINCIPE : ").append(nomPrincipe).append("\n");
            ctx.append("Score    : ")
               .append(spp.getScore()).append("/").append(spp.getScoreMax())
               .append(" (").append(pct).append("%)\n");

            // filter responses for this principle — no DB call, uses the map
            List<ReponseEntity> reponsesForPrincipe = evaluation.getReponses()
                .stream()
                .filter(r -> {
                    CritereEntity c = critereMap.get(r.getCritereId());
                    return c != null && c.getPratique()
                                        .getPrincipe()
                                        .getId()
                                        .equals(spp.getPrincipeId());
                })
                .toList();

            if (!reponsesForPrincipe.isEmpty()) {
                ctx.append("Critères :\n");
                for (ReponseEntity r : reponsesForPrincipe) {
                    CritereEntity c = critereMap.get(r.getCritereId());
                    String nomCritere = (c != null) ? c.getNom() : "Critère #" + r.getCritereId();

                    ctx.append("  - ").append(nomCritere)
                       .append(" → ").append(mapValeur(r.getValeur()));

                    if (r.getCommentaire() != null && !r.getCommentaire().isBlank()) {
                        ctx.append(" (").append(r.getCommentaire()).append(")");
                    }
                    ctx.append("\n");
                }
            }
            ctx.append("\n");
        }

        return ctx.toString();
    }
}
