package com.example.authentify.entity;

//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.OneToOne;
//import jakarta.persistence.JoinColumn;
//import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;

//import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import lombok.Data;
import jakarta.persistence.CascadeType;
import java.util.List;
//import java.util.Date;

import lombok.NoArgsConstructor;

@Entity
@Table(name = "organismes") //  table name is "users"
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

@JsonIgnoreProperties({"user"}) // ignore the back-reference to avoid infinite loop
public class OrganismeEntity {
    @Id // Assuming you have an ID field for the user entity
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY) // Assuming you want the ID to be generated automatically
    private Long id;
    private String nomOrganisme;
    //@Column(unique = true)
    private String emailOrganisme;
    private String adresse;
    private String secteur;
    private String fax;
    private String telephone;
    private String type;
    @Column(name="date_creation")
    private LocalDate dateCreation;

    private String logoUrl;

    //@JsonIgnore
    @OneToOne(mappedBy = "organisme", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonManagedReference
    @JsonIgnoreProperties("organisme") // ignore back-reference
    private UserEntity responsable;

    @OneToMany(mappedBy = "organisme", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<EvaluationEntity> evaluations;


}
