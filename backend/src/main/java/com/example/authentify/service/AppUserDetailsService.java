package com.example.authentify.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import java.util.ArrayList;

import com.example.authentify.entity.UserEntity;
import com.example.authentify.entity.DemandeEntity;
import com.example.authentify.repository.UserRepository;
import com.example.authentify.repository.DemandeRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import lombok.RequiredArgsConstructor;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final DemandeRepository demandeRepository;
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        //option1=user
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            return new User(
                    user.getEmail(),        // username
                    user.getPassword(),     // password (VERY IMPORTANT)
                    new ArrayList<>()       // roles (empty for now)
            );
        }
        //ption 2=demande
        Optional<DemandeEntity> demandeOpt = demandeRepository.findByEmail(email);
        if (demandeOpt.isPresent()) {
            DemandeEntity demande = demandeOpt.get();
            return new User(
                    demande.getNom(),
                    demande.getEmail(),
                    new ArrayList<>()
            );
        }
        throw new UsernameNotFoundException("Demande not found with email: " + email);
    }

   

    /*public DemandeDetails loadDemandeByEmail(String email) throws UsernameNotFoundException {
        DemandeEntity existingDemande = demandeRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Demande not found with email: " + email));
        return new DemandeDetails(existingDemande.getNom(), existingDemande.getEmail(), new ArrayList<>()); // You can set authorities/roles as needed
    }*/
}

    


