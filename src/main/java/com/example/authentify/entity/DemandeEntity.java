package com.example.authentify.entity;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
//import java.time.LocalDate;
//import java.util.Date;

@Entity
@Table(name = "demandes") //  table name is "demandes"
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class DemandeEntity {
    @Id // Assuming you have an ID field for the user entity
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY) // Assuming you want the ID to be generated automatically
    private Long id;
    private String nom;
    private String prenom;
    @Column(unique = true) //  email should be unique
    private String email;
    private String nomOrganisme;
    private String typeOrganisme;
    private String role;
    private String telephone;
    private String description;
    private String adresse;
    private String fax;
    private String emailOrganisme;
    private String secteur;
    @Column(name="date_creation")
    private LocalDate dateCreation;
    
    @Column(name = "logo_url")
    private String logoUrl;

    @Builder.Default
    @Column(name="etat", columnDefinition = "VARCHAR(255) DEFAULT 'en attente'") // Set default value for the "etat" column
    private String etat = "en attente"; // Default value for the "etat" field
    //private String verify_code;
    //private Long code_expiration_time;
    @CreationTimestamp
    @Column(updatable = false) //  creation time should not be updated after creation
    private java.sql.Timestamp created_at;
    @UpdateTimestamp
    private java.sql.Timestamp updated_at;
    
}
