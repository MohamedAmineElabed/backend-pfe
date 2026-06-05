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
@Data //  generates getters, setters, toString, equals, and hashCode methods
@Builder //  builder pattern for creating instances of UserEntity
@AllArgsConstructor //  constructor with all fields as parameters
@NoArgsConstructor  //  default constructor with no parameters
public class UserEntity {

    @Id // Assuming you have an ID field for the user entity
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY) // Assuming you want the ID to be generated automatically
    private Long id;

    private String nom;
    private String prenom;
    private String adresseResp;
    @Column(unique = true) //  email should be unique
    private String email;
    //private String organisme;
    //private String typeOrganisme;
    private String role;
    private String jobRole;
    //@Builder.Default
    private String etat; // Default value for the "etat" field
    //private String telephone;
    private String password;
    private String verify_code;
    private Long code_expiration_time;
    @OneToOne(fetch = FetchType.EAGER) // 1-to-1 relationship with OrganismeEntity, fetch it eagerly when loading the user
    @JoinColumn(name = "organisme_id",unique =true)
    @JsonIgnoreProperties("responsable") // pour éviter la boucle infinie
    //@JsonBackReference

    @JsonManagedReference // pour sérialiser l'organisme avec le user
    private OrganismeEntity organisme;
    /*@Builder.Default
    @Column(nullable = false)
    private boolean enabled = false;*/
    

    @CreationTimestamp
    @Column(updatable = false) //  creation time should not be updated after creation
    private java.sql.Timestamp created_at;
    @UpdateTimestamp
    private java.sql.Timestamp updated_at;

}
