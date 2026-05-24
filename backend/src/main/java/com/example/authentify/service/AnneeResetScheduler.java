package com.example.authentify.service;

import com.example.authentify.repository.EvaluationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnneeResetScheduler {

    private final EvaluationRepository evaluationRepository;

    // Runs at 00:00:00 on January 1st every year
    @Scheduled(cron = "0 0 0 1 1 *")
    public void reinitialiserAnnee() {
        int newYear = LocalDate.now().getYear();
        log.info("=== Réinitialisation annuelle déclenchée pour l'année {} ===", newYear);
        // Nothing to delete — new evaluations will automatically get annee = newYear
        // Old evaluations stay in DB for history
        log.info("Les organismes peuvent désormais soumettre leurs évaluations pour {}.", newYear);
    }
}
