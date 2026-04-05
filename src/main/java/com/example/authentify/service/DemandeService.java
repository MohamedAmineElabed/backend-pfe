package com.example.authentify.service;

import java.util.List;

import com.example.authentify.entity.DemandeEntity;
//import com.example.authentify.io.ProfileRequest;
//import com.example.authentify.io.ProfileResponse;
import com.example.authentify.io.DemandeRequest;


public interface DemandeService {
    // Register a new demande

    List<DemandeEntity> getAllDemandes(); // Method to retrieve all demandes
    DemandeEntity validerDemande(Long id);
    void refuserDemande(Long id);
    DemandeEntity createDemande(DemandeRequest request);
    void deleteDemande(Long id);
}
