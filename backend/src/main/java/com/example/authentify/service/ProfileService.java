package com.example.authentify.service;

import com.example.authentify.entity.OrganismeEntity;

//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestBody;

import com.example.authentify.entity.UserEntity;

//import org.springframework.context.annotation.Profile; // This annotation is used to specify that this service should only be active for a specific profile (e.g., "dev", "prod")
import java.util.List;

//import org.springframework.boot.autoconfigure.security.SecurityProperties.User;

import com.example.authentify.io.ProfileRequest;
import com.example.authentify.io.ProfileResponse;
import com.example.authentify.io.RegisterFromDemandeRequest;
import com.example.authentify.io.PasswordRequest;
import com.example.authentify.io.OrganismeRequest;
//import com.example.authentify.io.ResetPasswordRequest;
import com.example.authentify.io.OrganismeResponse;

public interface ProfileService {
    //users
    ProfileResponse createProfile(ProfileRequest request);
    ProfileResponse login(ProfileRequest request);
    // get user by email
    UserEntity getUserByEmail(String email);
    //update user
    UserEntity updateUser(Long id,ProfileRequest request);
     // get all users
    List<UserEntity> getAllUsers();
    //update user password
    UserEntity updateUserPassword(PasswordRequest request);
    //get user by Id
    UserEntity getUserById(Long id);
    UserEntity activerUser(long id);
    UserEntity desactiverUser(long id);


    UserEntity registerUserFromDemande(String email,RegisterFromDemandeRequest request);
    //reset password avec otp
    void sendResetOtp(String email);
    boolean verifyOtp(String email, String otp);
    void resetPassword(String email,String newPassword);
    //get all organismes
    List<OrganismeEntity> getAllOrganismes();
    //update organisme
    OrganismeEntity updateOrganisme(Long id,OrganismeRequest request);
    //OrganismeEntity updateOrganisme(OrganismeEntity organisme);

    OrganismeResponse createOrganisme(OrganismeRequest request);
    OrganismeEntity getOrganismeById(Long organismeId);
    void deleteOrganisme(Long id);
    void deleteUser(Long id);
    //void sendValidationEmail(String email);
    //void assignResponsableToOrganisme(Long organismeId, ProfileRequest request);



    
}
