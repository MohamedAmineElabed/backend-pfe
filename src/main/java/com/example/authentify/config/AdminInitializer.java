package com.example.authentify.config;

import org.springframework.boot.CommandLineRunner;
//import org.springframework.boot.autoconfigure.security.SecurityProperties.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.authentify.entity.OrganismeEntity;
//import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.authentify.entity.UserEntity;
//import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.authentify.repository.UserRepository;
import com.example.authentify.repository.OrganismeRepository;

import lombok.AllArgsConstructor;
//import java.text.SimpleDateFormat;
import java.time.LocalDate;
//import java.util.Date;


@Configuration
@AllArgsConstructor
public class AdminInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrganismeRepository organismeRepository;
    @Bean
    public CommandLineRunner createAdmin() {
        String adminEmail = "admin@example.com";
        return args -> {      
                // Create organisme admin
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


                // Create organisme evaluateur
                OrganismeEntity orgEval = organismeRepository
                    .findByEmailOrganisme("eval@cni.tn")
                    .orElseGet(() -> {
                        OrganismeEntity org = new OrganismeEntity();
                        org.setNomOrganisme("CNI Evaluateur");
                        org.setEmailOrganisme("eval@cni.tn");
                        org.setAdresse("Tunis");
                        org.setSecteur("Public");
                        org.setTelephone("70000001"); // numéro différent
                        org.setFax("333334");        // fax différent
                        org.setType("publique");
                        org.setDateCreation(LocalDate.of(2005, 6, 15)); // date différente
                        return organismeRepository.save(org);
                    });

                // Create admin
                //String adminEmail = "admin@example.com";
                if (!userRepository.existsByEmail(adminEmail)) {   // Check if an admin user already exists
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
        }
        else {
            System.out.println("Admin user already exists.");
        }

            // ----- Create Evaluateur -----
                String evaluateurEmail = "evaluateur@example.com";
                if (!userRepository.existsByEmail(evaluateurEmail)) {
                    UserEntity evaluateur = new UserEntity();
                    evaluateur.setNom("John");
                    evaluateur.setPrenom("Doe");
                    evaluateur.setEmail(evaluateurEmail);
                    evaluateur.setPassword(passwordEncoder.encode("evaluateur123"));
                    evaluateur.setRole("EVALUATEUR");  // your role name
                    evaluateur.setOrganisme(orgEval); // assign organisme
                    evaluateur.setEtat("actif");

                    userRepository.save(evaluateur);

                    System.out.println("Évaluateur user created.");
                } else {
                    System.out.println("Évaluateur user already exists.");
                }

    };
}
}
