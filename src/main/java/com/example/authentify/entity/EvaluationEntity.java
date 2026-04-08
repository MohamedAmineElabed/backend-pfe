package com.example.authentify.entity;

//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;

//import com.fasterxml.jackson.annotation.JsonBackReference;
//import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

//import jakarta.persistence.OneToOne;
//import jakarta.persistence.JoinColumn;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
//import com.example.authentify.entity.PratiqueEntity;


//import jakarta.persistence.Column;
import jakarta.persistence.Entity;
//import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "evaluations") 
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationEntity {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;
    private String statut;

    //@Builder.Default
    @Column(nullable = true) // allow null in the database
    private Integer score;

    //@Builder.Default
    @Column(name="score_max",nullable = false) 
    private Integer scoreMax;

    private String label;


    @CreationTimestamp
    @Column(updatable = false) //  creation time should not be updated after creation
    private java.sql.Timestamp dateSoumission;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organisme_id")
    @JsonIgnoreProperties("evaluations")
    private OrganismeEntity organisme;

    private long responsableId;

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ReponseEntity> reponses;

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference // This annotation is used to manage the bidirectional relationship and prevent infinite recursion during JSON serialization
    private List<ScoreParPrincipeEntity> scoresParPrincipe;


}
