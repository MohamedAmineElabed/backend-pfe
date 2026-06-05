package com.example.authentify.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.authentify.entity.OrganismeEntity;
import com.example.authentify.entity.UserEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.authentify.repository.UserRepository;
import com.example.authentify.repository.OrganismeRepository;

import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Configuration
@AllArgsConstructor
public class AdminInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrganismeRepository organismeRepository;

    @Bean
    public CommandLineRunner createAdmin() {
        return args -> {
            try {

                // ── Organisme admin ───────────────────────────────────────────
                OrganismeEntity orgAdmin = organismeRepository
                    .findByEmailOrganisme("admin@cni.tn")
                    .orElseGet(() -> {
                        OrganismeEntity org = new OrganismeEntity();
                        org.setNomOrganisme("CNI Admin");
                        org.setEmailOrganisme("admin@cni.tn");
                        org.setAdresse("Tunis");
                        org.setSecteur("Public");
                        org.setTelephone("70000000");
                        org.setFax("333333");
                        org.setType("publique");
                        org.setDateCreation(LocalDate.of(2004, 5, 12));
                        return organismeRepository.save(org);
                    });

                // ── Organisme evaluateur ──────────────────────────────────────
                OrganismeEntity orgEval = organismeRepository
                    .findByEmailOrganisme("eval@cni.tn")
                    .orElseGet(() -> {
                        OrganismeEntity org = new OrganismeEntity();
                        org.setNomOrganisme("CNI Evaluateur");
                        org.setEmailOrganisme("eval@cni.tn");
                        org.setAdresse("Tunis");
                        org.setSecteur("Public");
                        org.setTelephone("70000001");
                        org.setFax("333334");
                        org.setType("publique");
                        org.setDateCreation(LocalDate.of(2005, 6, 15));
                        return organismeRepository.save(org);
                    });

                // ── Admin user ────────────────────────────────────────────────
                String adminEmail = "admin@example.com";
                if (!userRepository.existsByEmail(adminEmail)) {
                    // Only assign orgAdmin if it isn't already linked to another user
                    if (orgAdmin.getResponsable() == null) {
                        UserEntity admin = new UserEntity();
                        admin.setNom("Admin");
                        admin.setPrenom("Centrale");
                        admin.setEmail(adminEmail);
                        admin.setPassword(passwordEncoder.encode("admin123"));
                        admin.setRole("ADMIN");
                        admin.setOrganisme(orgAdmin);
                        admin.setEtat("actif");
                        userRepository.save(admin);
                        System.out.println("Admin user created.");
                    } else {
                        System.out.println("Admin organisme already linked — skipping admin creation.");
                    }
                } else {
                    System.out.println("Admin user already exists.");
                }

                // ── Evaluateur user ───────────────────────────────────────────
                String evaluateurEmail = "evaluateur@example.com";
                if (!userRepository.existsByEmail(evaluateurEmail)) {
                    // Only assign orgEval if it isn't already linked to another user
                    if (orgEval.getResponsable() == null) {
                        UserEntity evaluateur = new UserEntity();
                        evaluateur.setNom("John");
                        evaluateur.setPrenom("Doe");
                        evaluateur.setEmail(evaluateurEmail);
                        evaluateur.setPassword(passwordEncoder.encode("evaluateur123"));
                        evaluateur.setRole("EVALUATEUR");
                        evaluateur.setOrganisme(orgEval);
                        evaluateur.setEtat("actif");
                        userRepository.save(evaluateur);
                        System.out.println("Évaluateur user created.");
                    } else {
                        System.out.println("Évaluateur organisme already linked — skipping evaluateur creation.");
                    }
                } else {
                    System.out.println("ℹÉvaluateur user already exists.");
                }

            } catch (Exception e) {
                // Log and swallow — seed data already exists from a previous deployment.
                // The app must NOT crash on startup because of duplicate seed data.
                System.out.println("⚠️  AdminInitializer skipped (seed data already present): " + e.getMessage());
            }
        };
    }
}