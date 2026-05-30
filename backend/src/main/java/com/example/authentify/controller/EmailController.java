package com.example.authentify.controller;

import org.springframework.http.ResponseEntity;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
//import com.example.authentify.service.EmailService;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.authentify.service.ProfileService;

import com.example.authentify.io.PasswordRequest;
import com.example.authentify.service.EmailService;
import lombok.AllArgsConstructor;
import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1.0/email")
public class EmailController {
    private final EmailService emailService;
    private final ProfileService profileService;
    //private final PasswordRequest passwordRequest;

   /* @PostMapping("/send-welcome")
    public ResponseEntity<String> sendWelcomeEmail(@RequestBody Map<String,String> request){
            String email = request.get("email");
            String subject = request.get("subject");
            String body = request.get("body");
            

        boolean sent = emailService.sendWelcomeEmail(email, subject,body);

        if (sent) {
            return ResponseEntity.ok("Email sent successfully");
        } else {
            return ResponseEntity.status(500).body("Failed to send email");
        }
    }*/

    /*@PostMapping("/send-valide")
    public ResponseEntity<String> sendValidationEmail(@RequestBody Map<String,String> request){
          
            String email = request.get("email");
            String validationUrl = request.get("validationUrl");
        boolean sent = emailService.sendValidationEmail(email,validationUrl);

        if (sent) {
            return ResponseEntity.ok("Email sent successfully");
        } else {
            return ResponseEntity.status(500).body("Failed to send email");
        }
    }*/
   
    @PostMapping("/send-reset-otp")
    public ResponseEntity<String> sendResetOtp(@RequestBody PasswordRequest request){
            /*@RequestParam String email,
            @RequestParam String name) {*/
        profileService.sendResetOtp(request .getEmail());
        return ResponseEntity.ok("OTP sent successfully");
            

        
    }
   
    


}
