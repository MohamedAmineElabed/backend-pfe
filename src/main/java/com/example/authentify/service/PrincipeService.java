package com.example.authentify.service;

import com.example.authentify.io.PrincipeResponse;
import com.example.authentify.entity.PrincipeEntity;
//import com.example.authentify.entity.UserEntity;
import com.example.authentify.entity.PratiqueEntity;
import com.example.authentify.entity.CritereEntity;
import com.example.authentify.io.PrincipeRequest;
import java.util.List;

public interface PrincipeService {
    //principe
    PrincipeResponse createPrincipe(PrincipeRequest request);
    List<PrincipeEntity> getAllPrincipes();
    void deletePrincipe(Long id);
    PrincipeEntity updatePrincipe(PrincipeEntity principe);

    //pratique
    PrincipeResponse createPratique(PrincipeRequest request);
    List<PratiqueEntity> getAllPratiques();
    void deletePratique(Long id);
    PratiqueEntity updatePratique(PratiqueEntity pratique);

    //critere
    PrincipeResponse createCritere(PrincipeRequest request);
    List<CritereEntity> getAllCriteres();
    void deleteCritere(Long id);
    CritereEntity updateCritere(CritereEntity critere);



}
