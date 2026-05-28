package com.example.authentify.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
//import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity;
import java.lang.Exception;

//import com.example.authentify.entity.DemandeEntity;
//import com.example.authentify.entity.DemandeEntity;
import com.example.authentify.entity.UserEntity;
import com.example.authentify.io.ProfileRequest;
import com.example.authentify.io.ProfileResponse;
import com.example.authentify.io.RegisterFromDemandeRequest;
import com.example.authentify.io.ResetPasswordRequest;
import com.example.authentify.repository.UserRepository;
//import com.example.authentify.repository.DemandeRepository;
import com.example.authentify.io.PasswordRequest;
import com.example.authentify.service.JwtService;
//import com.example.authentify.service.EmailService;
import com.example.authentify.service.ProfileService;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
//import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.http.HttpHeaders;
//import org.springframework.http.ResponseCookie;
//import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;

//import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api/v1.0")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;
    //private final EmailService emailService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    //private final ProfileResponse profileResponse;


    //récuperer tous les users
    @GetMapping("/users")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        List<UserEntity> user = profileService.getAllUsers();
        return ResponseEntity.ok(user);
    }

   
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    // Validate the incoming request using @Valid and @RequestBody annotations
    public ProfileResponse registerProfile( @Valid @RequestBody ProfileRequest request)  {   
        ProfileResponse response = profileService.createProfile(request);
        //to do :send welcome email
        //emailService.sendWelcomeEmail(response.getEmail(),response.getNom());

        return response;
    }
   
    @GetMapping("/test")
    public String test(){
        return "Auth is working";
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody ProfileRequest request){
        ProfileResponse response = profileService.login(request);
        if(response == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Email ou mot de passe incorrect");
        }
        String token = response.getToken(); //save token before nulling it
        //Set token as httpOnly cookie
        ResponseCookie cookie = ResponseCookie.from("token", response.getToken())
            .httpOnly(true)
            .secure(true)      // set true in production
            .sameSite("None")
            .path("/")
            .maxAge(Duration.ofHours(8)) // token valid for 8 hours
            //.sameSite("Lax")
            //.secure(false)
            .build();
        //response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        response.setToken(null); // don't expose token in body

    //return ResponseEntity.ok(profileResponse);
    return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .header("X-Auth-Token", token)
            .body(response);
}

    @GetMapping("/users/{id}") 
    public UserEntity getUserById(@PathVariable Long id) {
        return profileService.getUserById(id);
}

    @GetMapping("/evaluateurs/{id}")
    public ResponseEntity<UserEntity> getEvaluateurById(@PathVariable Long id) {
        UserEntity user = profileService.getUserById(id);
        if (user != null && "EVALUATEUR".equals(user.getRole())) {
            return ResponseEntity.ok(user);
        }
    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
}

    @GetMapping("/responsables/{id}")
        public ResponseEntity<UserEntity> getResponsableById(@PathVariable Long id) {
            UserEntity user = profileService.getUserById(id);
            if (user != null && "RESPONSABLE".equals(user.getRole())) {
                return ResponseEntity.ok(user);
            }
    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
}
    @PutMapping("/users/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,@RequestBody ProfileRequest request) {
       try {
        UserEntity updatedUser = profileService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
    @PutMapping("/users/update-password")
    public ResponseEntity<?> updateUserPassword(@RequestBody @Valid PasswordRequest request) {
        profileService.updateUserPassword(request);
        return ResponseEntity.ok("Updated");
}
    /*@PostMapping("/register-from-demande/{email}")
        public ResponseEntity<?> registerUserFromDemande(@PathVariable String email, @RequestBody PasswordRequest request) {
            //DemandeRepository demande=demandeRepository(demande.findById(demandeId));
            profileService.registerUserFromDemande(email,request);
        return ResponseEntity.ok("User enregistrer avec succés");
}*/ 

    @GetMapping("/check-email")
    public Map<String, Boolean> checkEmail(@RequestParam String email){
        boolean exists = userRepository.findByEmail(email).isPresent();
        return Map.of("exists", exists);
}
    @PostMapping("/register-from-demande/{email}")
    public ResponseEntity<?> registerUserFromDemande(@PathVariable String email,@RequestBody @Valid RegisterFromDemandeRequest request) {
    try {
        UserEntity user = profileService.registerUserFromDemande(email,request);
        //Return user object (must contain id)
        return ResponseEntity.ok(user);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}



    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody PasswordRequest request) {
    try {
        boolean valid = profileService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );
        return ResponseEntity.ok(valid);
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {

    try {
        profileService.resetPassword(
                request.getEmail(),
                request.getNewPassword()
        );

        return ResponseEntity.ok("Password reset successful");

    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

    private ResponseCookie clearCookie() {
    return ResponseCookie.from("token", "")
            .httpOnly(true)
            .path("/")
            .maxAge(0)
            .build();
}

    @GetMapping("/users/me")
    public ResponseEntity<UserEntity> getCurrentUser(HttpServletRequest request) {

    String token = null;

    if (request.getCookies() != null) {
        for (Cookie c : request.getCookies()) {
            if ("token".equals(c.getName())) {
                token = c.getValue();
                break;
            }
        }
    }

    if (token == null || !jwtService.isTokenValid(token)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .header(HttpHeaders.SET_COOKIE, clearCookie().toString())
        .build();
    }

    String email = jwtService.extractEmail(token);

    return userRepository.findByEmail(email)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
}


    @DeleteMapping("/organismes/{id}")
    public ResponseEntity<?> deleteOrganisme(@PathVariable Long id) {
        try{
            profileService.deleteOrganisme(id);
            return ResponseEntity.ok("Organisme deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}/desactiver")
    public ResponseEntity <UserEntity> desactiverUser(@PathVariable Long id) {
        UserEntity user = profileService.desactiverUser(id);
        return ResponseEntity.ok(user);
    }
    @PutMapping("/users/{id}/activer")
    public ResponseEntity <UserEntity> activerUser(@PathVariable Long id) {
        UserEntity user = profileService.activerUser(id);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try{
            profileService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
