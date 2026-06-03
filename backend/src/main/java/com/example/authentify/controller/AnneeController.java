package com.example.authentify.controller;

import com.example.authentify.repository.EvaluationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
//import java.util.stream.Collectors;
//import java.util.stream.IntStream;

@RestController
@RequestMapping("/api/v1.0/annee")
@RequiredArgsConstructor
public class AnneeController {

    private final EvaluationRepository evaluationRepository;

    // Current active year
    @GetMapping("/courante")
    public ResponseEntity<Integer> getAnneeCourante() {
        return ResponseEntity.ok(LocalDate.now().getYear());
    }

    // All years that have evaluations (for history dropdown)
   @GetMapping("/disponibles")
    public ResponseEntity<List<Integer>> getAnneesDisponibles() {
        return ResponseEntity.ok(evaluationRepository.findDistinctAnnees());
    }
    //années for a specific organisme
    @GetMapping("/disponibles/{organismeId}")
    public ResponseEntity<List<Integer>> getAnneesDisponiblesByOrganisme(@PathVariable Long organismeId) {
        return ResponseEntity.ok(evaluationRepository.findDistinctAnneesByOrganisme(organismeId));
}
}