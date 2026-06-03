package com.example.authentify.entity;

import jakarta.persistence.Column;



//import jakarta.persistence.Column;
import jakarta.persistence.Entity;
//import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "preuves") 
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PreuveEntity {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;
    private String nomFichier;
    private String typeFichier;
    private String cheminFichier;
    private Integer tailleFichier;

    @ManyToOne
    @JoinColumn(name = "reponse_id")
    @JsonBackReference
    private ReponseEntity reponse;

    @CreationTimestamp
    @Column(updatable = false) //  creation time should not be updated after creation
    private java.sql.Timestamp created_at;

}
