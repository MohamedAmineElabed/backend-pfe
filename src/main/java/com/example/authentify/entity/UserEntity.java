package com.example.authentify.entity;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

//import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.OneToOne;
import jakarta.persistence.JoinColumn;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users") //  table name is "users"
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity {

    @Id // Assuming you have an ID field for the user entity
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY) // Assuming you want the ID to be generated automatically
    private Long id;
    private String nom;
    private String prenom;
    @Column(unique = true) //  email should be unique
    private String email;
    //private String organisme;
    //private String typeOrganisme;
    private String role;
    //@Builder.Default
    private String etat; // Default value for the "etat" field
    //private String telephone;
    private String password;
    private String verify_code;
    private Long code_expiration_time;
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organisme_id",unique =true)
    @JsonIgnoreProperties("responsable") // pour éviter la boucle infinie
    //@JsonBackReference
    @JsonManagedReference
    private OrganismeEntity organisme;
    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = false;
    

    @CreationTimestamp
    @Column(updatable = false) //  creation time should not be updated after creation
    private java.sql.Timestamp created_at;
    @UpdateTimestamp
    private java.sql.Timestamp updated_at;

}
