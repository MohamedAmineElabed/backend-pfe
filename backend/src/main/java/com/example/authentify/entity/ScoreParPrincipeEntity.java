package com.example.authentify.entity;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
//import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

//import com.fasterxml.jackson.annotation.JsonBackReference;
//import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

//import jakarta.persistence.OneToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "scoreParPrincipe", uniqueConstraints = @UniqueConstraint(columnNames = {"evaluation_id", "principeId"})) 
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScoreParPrincipeEntity {

    @Id // Assuming you have an ID field for the user entity
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY) // Assuming you want the ID to be generated automatically
    private Long id;

    // Reference to the evaluation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id")
    @JsonBackReference // To prevent infinite recursion during JSON serialization
    private EvaluationEntity evaluation;

    @JsonProperty("evaluationId") // To include evaluationId in JSON output
    public Long getEvaluationId() {
        return evaluation != null ? evaluation.getId() : null;
    }

    // Reference to the responsable
    private Long responsableId;
    //Reference to the organisme
    private Long organismeId;

    private Long principeId;

    // Score for this principle
    @Builder.Default
    @Column(nullable = false)
    private Integer score = 0;

    // ScoreMax for this principle
    @Builder.Default
    @Column(nullable = false)
    private Integer scoreMax = 0;
    
    @CreationTimestamp
    @Column(updatable = false) //  creation time should not be updated after creation
    private java.sql.Timestamp created_at;
    @UpdateTimestamp
    private java.sql.Timestamp updated_at;

}
