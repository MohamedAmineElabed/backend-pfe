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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "principes") 
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PrincipeEntity {
    @Id // Assuming you have an ID field for the user entity
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY) // Assuming you want the ID to be generated automatically
    private Long id;
    private String nom;
    private String description;

    @OneToMany(mappedBy = "principe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<PratiqueEntity> pratiques;

    @CreationTimestamp
    @Column(updatable = false) //  creation time should not be updated after creation
    private java.sql.Timestamp created_at;
    @UpdateTimestamp
    private java.sql.Timestamp updated_at;


}
