package com.example.authentify.service;
import org.springframework.http.HttpStatus;
//import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
//import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;
//import java.util.Optional;
import java.util.List;

import com.example.authentify.entity.DemandeEntity;
import com.example.authentify.entity.OrganismeEntity;
import com.example.authentify.entity.UserEntity;
import com.example.authentify.io.OrganismeResponse;
import com.example.authentify.io.PasswordRequest;
import com.example.authentify.io.ProfileRequest;
import com.example.authentify.io.RegisterFromDemandeRequest;
//import com.example.authentify.service.JwtService;


import com.example.authentify.io.OrganismeRequest;

import com.example.authentify.io.ProfileResponse;
import com.example.authentify.repository.DemandeRepository;
import com.example.authentify.repository.UserRepository;

import jakarta.transaction.Transactional;

import com.example.authentify.repository.OrganismeRepository;
import java.lang.Long;
import java.nio.file.Path;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.ThreadLocalRandom;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileServiceImp implements ProfileService {
    private final UserRepository userRepository;
    private final OrganismeRepository organismeRepository;
    private final DemandeRepository demandeRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    // Méthode utilitaire pour créer un OrganismeEntity
    private OrganismeEntity buildOrganismeFromRequest(ProfileRequest request) {
    if (request == null || request.getOrganisme() == null) {
        return null; // rien à créer
    }

    OrganismeEntity organisme = new OrganismeEntity();
    organisme.setNomOrganisme(request.getOrganisme());
    organisme.setType(request.getTypeOrganisme());
    organisme.setEmailOrganisme(request.getEmailOrganisme()); // si disponible
    organisme.setAdresse(request.getAdresse()); // si disponible
    organisme.setTelephone(request.getTelephoneOrganisme()); // si disponible
    // ajouter d'autres champs si nécessaire

    return organisme;
}



    @Override
    public ProfileResponse createProfile(ProfileRequest request) {
        UserEntity newProfile = convertToUserEntity(request);
        if(!userRepository.existsByEmail(request.getEmail())) {
            UserEntity savedProfile = userRepository.save(newProfile);
            return convertToProfileResponse(savedProfile);

        }
        throw new RuntimeException("Email already exists");
        
    }

     @Override
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }
    
    private UserEntity convertToUserEntity(ProfileRequest request) {     
        OrganismeEntity organisme = buildOrganismeFromRequest(request);
        UserEntity userEntity = UserEntity.builder()
            .nom(request.getNom())
            .prenom(request.getPrenom())
            .email(request.getEmail())
            .organisme(organisme)
            .role(request.getRole())
            .build();

        return userEntity;
    }
    
    private ProfileResponse convertToProfileResponse(UserEntity userEntity) {
    // Construire le ProfileResponse de base
    ProfileResponse response = ProfileResponse.builder()
            .id(userEntity.getId())
            .nom(userEntity.getNom())
            .prenom(userEntity.getPrenom())
            .email(userEntity.getEmail())
            .role(userEntity.getRole())
            .build();

    // Ajouter l'organisme si présent
    OrganismeEntity organisme = userEntity.getOrganisme(); 
    if (organisme != null) {
        response.setOrganisme(
            OrganismeResponse.builder()
                .id(organisme.getId())
                .nomOrganisme(organisme.getNomOrganisme())
                .emailOrganisme(organisme.getEmailOrganisme())
                .adresse(organisme.getAdresse())
                .telephone(organisme.getTelephone())
                .type(organisme.getType())
                .dateCreation(organisme.getDateCreation())
                .build()
        );
    }

    return response;
}
    

    public ProfileResponse login(ProfileRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new RuntimeException("Invalid password");
    }
        // Check if user is active
        if (!"actif".equalsIgnoreCase(user.getEtat())) {
            throw new RuntimeException("User is not active. Login denied.");
    }
        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        ProfileResponse response=convertToProfileResponse(user);
        response.setToken(token);
        return response;
    }
    

@Override
public UserEntity registerUserFromDemande(String email, RegisterFromDemandeRequest request){
    //Vérification email vide
    if(email == null || email.trim().isEmpty()){
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, 
            "Email invalide"
        );
    }
    email = email.trim();

    //Vérifier si la demande existe
    DemandeEntity demande = demandeRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, 
            "Demande non trouvée"
        ));
    email = demande.getEmail();

    //Vérifier si l'utilisateur existe déjà
    if (userRepository.findByEmail(email).isPresent()){
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Email already exists");
    }

    //Vérification de la force du mot de passe
    String password = request.getPassword();
    if (!isStrongPassword(password)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weak password");
    }
    // Step 1: create the user
    UserEntity user = new UserEntity();
    user.setEmail(demande.getEmail());
    user.setNom(demande.getNom());
    user.setPrenom(demande.getPrenom());
    user.setRole(demande.getRole());
    user.setEtat("actif");
    user.setPassword(passwordEncoder.encode(password));

    // Step 2: save the user first
    user=userRepository.save(user);

    

    // Créer l'organisme à partir des infos de la demande
    OrganismeEntity organisme = new OrganismeEntity();
    organisme.setNomOrganisme(demande.getNomOrganisme());
    organisme.setType(demande.getTypeOrganisme());
    organisme.setEmailOrganisme(demande.getEmailOrganisme());
    organisme.setAdresse(demande.getAdresse());
    organisme.setTelephone(demande.getTelephone());
    organisme.setSecteur(demande.getSecteur());
    organisme.setFax(demande.getFax());
    organisme.setDateCreation(demande.getDateCreation());
    organisme.setResponsable(user);
    organisme.setLogoUrl(demande.getLogoUrl());

    // Sauvegarder l'organisme en DB
    organisme = organismeRepository.save(organisme);
    user.setOrganisme(organisme);
    //sendValidationEmail(user.getEmail());
    return userRepository.save(user);
    
}

private boolean isStrongPassword(String password) {
    if (password == null) return false;
    return password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$");
}

//////////////////////////////////////////////////////////////////////////////////////////

    
    /////////////
    @Override
    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() ->new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found"));

    }

    
    
    public UserEntity updateUser(Long id, ProfileRequest request){

    UserEntity user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("User not found"));

    user.setNom(request.getNom());
    user.setPrenom(request.getPrenom());
    user.setEmail(request.getEmail());
    user.setRole(request.getRole());

    /*// Optional: update organisme if provided
    if (request.getOrganisme() != null) {
        OrganismeEntity organisme = user.getOrganisme();
        if (organisme == null) {
            organisme = new OrganismeEntity();
        }
        organisme.setNomOrganisme(request.getOrganisme());
        organisme.setType(request.getTypeOrganisme());
        organisme.setEmailOrganisme(request.getEmailOrganisme());
        organisme.setAdresse(request.getAdresse());
        organisme.setTelephone(request.getTelephoneOrganisme());

        organisme = organismeRepository.save(organisme);
        user.setOrganisme(organisme);
    }*/

    // Save and return
    return userRepository.save(user);
}
    @Override
    public UserEntity updateUserPassword(PasswordRequest requestUser) {
        UserEntity existingUser = userRepository.findById(requestUser.getUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        if (!passwordEncoder.matches(requestUser.getOldPassword(), existingUser.getPassword())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,"Ancien mot de passe incorrect");
    }

        existingUser.setPassword(passwordEncoder.encode(requestUser.getNewPassword()));
        return userRepository.save(existingUser);
}


    @Override
    public void sendValidationEmail(String email) {

    UserEntity user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // ⏱️ set expiration (15 min)
    long expirationTime = System.currentTimeMillis() + (15 * 60 * 1000);

    user.setCode_expiration_time(expirationTime);
    user.setEnabled(false);

    userRepository.save(user);

    // 🔗 simple link (only email)
    String validationUrl = "http://localhost:8080/api/auth/validate?email=" + email;

    emailService.sendValidationEmailAsync(email, validationUrl);
}


    @Override
    public void sendResetOtp(String toEmail){
        UserEntity existingUser=userRepository.findByEmail(toEmail)
            .orElseThrow(()->new RuntimeException("user not found: "+toEmail));

        //generate 6digit otp
        String otp=String.valueOf(ThreadLocalRandom.current().nextInt(100000,1000000));
        
        //calculate expiring time(30min in milliseconds)
        long expiringTime=System.currentTimeMillis()+(30*60*1000);

        //update profile/user
        existingUser.setVerify_code(otp);
        existingUser.setCode_expiration_time(expiringTime);

        //save inti database
        userRepository.save(existingUser);

        try{
            //send reset email
            emailService.sendResetOtpEmail(existingUser.getEmail(), otp);
        }catch(Exception ex){
            throw new RuntimeException("unable to send email");
        }

    }

    @Override
    public boolean verifyOtp(String toEmail, String otp) {
        System.out.println("EMAIL = " + toEmail);
        System.out.println("OTP RECEIVED = " + otp);

        UserEntity user = userRepository.findByEmail(toEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("DB OTP = " + user.getVerify_code());

        if (user.getVerify_code() == null) {
        throw new RuntimeException("OTP not generated");
    }

        if (System.currentTimeMillis() > user.getCode_expiration_time()) {
            throw new RuntimeException("OTP expired");
    }

        if(user.getVerify_code().equals(otp)){
            user.setVerify_code(null);
            user.setCode_expiration_time(0L);
            userRepository.save(user);
            return true;
        }else{
            throw new RuntimeException("OTP invalid");
        }
}


    @Override
    public void resetPassword(String toEmail, String newPassword) {
        System.out.println("EMAIL = " + toEmail);
        System.out.println("new password = " + newPassword);

        UserEntity user = userRepository.findByEmail(toEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("DB OTP = " + user.getVerify_code());
        /*if (user.getVerify_code() != null) {
        throw new RuntimeException("OTP not verified");
    }*/
        user.setPassword(passwordEncoder.encode(newPassword));
        

        userRepository.save(user);
}

    public void deleteUser(Long id){
        UserEntity user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        OrganismeEntity org = user.getOrganisme();
        if (org != null) {
            org.setResponsable(null);        // unlink the responsable
            organismeRepository.save(org);   // persist change
        }

        // Supprimer l'utilisateur
        userRepository.delete(user); 
    }
    @Override
    public UserEntity desactiverUser(long id){
        UserEntity user=userRepository.findById(id)
            .orElseThrow(()->new RuntimeException("User not found"));
        user.setEtat("inactif");
        return userRepository.save(user);

    }
    @Override
    public UserEntity activerUser(long id){
        UserEntity user=userRepository.findById(id)
            .orElseThrow(()->new RuntimeException("User not found"));
        user.setEtat("actif");
        return userRepository.save(user);

    }



//////////////////////////////////////////////////////////////////////////

    // Méthode pour récupérer tous les organismes
    public List<OrganismeEntity> getAllOrganismes() {
        return organismeRepository.findAll();
    }
    //update les organismes
    /*public OrganismeEntity updateOrganisme(OrganismeEntity neworg){

    OrganismeEntity organisme = organismeRepository.findById(neworg.getId())
        .orElseThrow(() -> new RuntimeException("Organisme not found"));

    organisme.setNomOrganisme(neworg.getNomOrganisme());
    organisme.setAdresse(neworg.getAdresse());
    organisme.setEmailOrganisme(neworg.getEmailOrganisme());
    organisme.setType(neworg.getType());
    organisme.setTelephone(neworg.getTelephone());
    organisme.setFax(neworg.getFax());
    organisme.setSecteur(neworg.getSecteur());
    organisme.setDateCreation(neworg.getDateCreation());
    

    /*if(newUser.getOrganisme() != null){
        OrganismeEntity organisme = organismeRepository
            .findById(newUser.getOrganisme().getId())
            .orElseThrow(() -> new RuntimeException("Organisme not found"));

        user.setOrganisme(organisme);
    }

    return organismeRepository.save(organisme);
}*/

    public OrganismeEntity getOrganismeById(Long organismeId) {
        return organismeRepository.findById(organismeId).orElse(null);
    }


    public OrganismeEntity updateOrganisme(Long id, OrganismeRequest request) {
    OrganismeEntity organisme = organismeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Organisme not found"));

    organisme.setNomOrganisme(request.getNomOrganisme());
    organisme.setEmailOrganisme(request.getEmailOrganisme());
    organisme.setTelephone(request.getTelephone());
    organisme.setType(request.getType());
    organisme.setAdresse(request.getAdresse());
    organisme.setFax(request.getFax());
    organisme.setSecteur(request.getSecteur());
    organisme.setDateCreation(request.getDateCreation());
    //organisme.setLogoUrl(request.getLogoUrl());

    MultipartFile logoFile = request.getLogo(); // Make sure OrganismeRequest has MultipartFile logo
    if (logoFile != null && !logoFile.isEmpty()) {
        try {
            // Generate unique filename
            String fileName = System.currentTimeMillis() + "_" + logoFile.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/");
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            // Save the file
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(logoFile.getInputStream(), filePath);

            // Save path as String in the entity
            //organisme.setLogoUrl("/uploads/" + fileName);
            organisme.setLogoUrl("http://localhost:8080/api/v1.0/uploads/" + fileName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload logo", e);
        }
    }

    return organismeRepository.save(organisme);
}

    @Override
public OrganismeResponse createOrganisme(OrganismeRequest request) {
    if (organismeRepository.existsByEmailOrganisme(request.getEmailOrganisme())) {
        throw new RuntimeException("Email already exists");
    }

    OrganismeEntity newOrg = convertToOrganismeEntity(request);
    OrganismeEntity savedOrg = organismeRepository.save(newOrg);

    // Convert to response
    return OrganismeResponse.builder()
        .id(savedOrg.getId())
        .nomOrganisme(savedOrg.getNomOrganisme())
        .emailOrganisme(savedOrg.getEmailOrganisme())
        .adresse(savedOrg.getAdresse())
        .telephone(savedOrg.getTelephone())
        .type(savedOrg.getType())
        .dateCreation(savedOrg.getDateCreation())
        .secteur(savedOrg.getSecteur())
        .build();
}

    private OrganismeEntity convertToOrganismeEntity(OrganismeRequest request) {     
    return OrganismeEntity.builder()
        .nomOrganisme(request.getNomOrganisme())
        .adresse(request.getAdresse())
        .emailOrganisme(request.getEmailOrganisme())
        .fax(request.getFax())
        .secteur(request.getSecteur())
        .telephone(request.getTelephone())
        .dateCreation(request.getDateCreation())
        .logoUrl(request.getLogoUrl())
        .build();
}


    @Transactional
    public void deleteOrganisme(Long id){
        OrganismeEntity organisme = organismeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Organisme not found"));

        // Supprimer l'organisme
        organismeRepository.delete(organisme);
    }


    
}

