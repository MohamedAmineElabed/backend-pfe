package com.example.authentify.service;

/*import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final String fromEmail = "mohamedamineelabed2015@gmail.com";

    public boolean sendWelcomeEmail(String toEmail, String subject, String body) {
    try {
        if (toEmail == null || !toEmail.contains("@")) {
            System.out.println("Invalid email address");
            return false;
        }

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail.trim());
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
        System.out.println("mail sent avec success");
        
        return true;

    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}
    @Async
    public void sendValidationEmailAsync(String email, String url) {
    try {
        sendValidationEmail(email, url);
    } catch (Exception e) {
        System.out.println("Email sending failed: " + e.getMessage());
    }
}
public boolean sendValidationEmail(String toEmail, String validationUrl){
    try {
            if (toEmail == null || !toEmail.contains("@")) {
                System.out.println("Invalid email address");
                return false;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail.trim());
            helper.setSubject("Please validate your account");

            // HTML content with a button
            String htmlContent = "<html><body>"
                + "<h3>Welcome!</h3>"
                + "<p>Click the button below to validate your account:</p>"
                + "<a href='" + validationUrl + "' style=\""
                + "display:inline-block;"
                + "padding:10px 20px;"
                + "font-size:16px;"
                + "color:#ffffff;"
                + "background-color:#2563c7;"
                + "text-decoration:none;"
                + "border-radius:5px;"
                + "\">Validate Account</a>"
                + "<p>If you didn't register, you can ignore this email.</p>"
                + "</body></html>";

            helper.setText(htmlContent, true); // true = HTML
            mailSender.send(message);
            System.out.println("Validation email sent successfully");
            return true;
            

        } catch (MessagingException e) {
            e.printStackTrace();
            return false;
        }
    }

    public void sendResetOtpEmail(String toEmail,String otp){
        SimpleMailMessage message= new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail.trim());
        message.setSubject("Password Reset");
        message.setText("Votre code de verification est: "+otp);
        mailSender.send(message);
        System.out.println("mail sent avec success");
    }
}*/


import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    private final String fromEmail = "mohamedamineelabed2015@gmail.com";
    private final String fromName = "PFE Platform";
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private boolean sendEmail(String toEmail, String subject, String htmlContent) {
        try {
            if (toEmail == null || !toEmail.contains("@")) {
                System.out.println("Invalid email address");
                return false;
            }

            String body = String.format("""
                {
                    "sender": {"name": "%s", "email": "%s"},
                    "to": [{"email": "%s"}],
                    "subject": "%s",
                    "htmlContent": "%s"
                }
                """,
                fromName,
                fromEmail,
                toEmail.trim(),
                subject,
                htmlContent.replace("\"", "\\\"").replace("\n", "")
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("accept", "application/json")
                .header("api-key", brevoApiKey)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Brevo API response: " + response.statusCode() + " - " + response.body());
            return response.statusCode() == 201;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean sendWelcomeEmail(String toEmail, String subject, String bodyText) {
        String html = "<html><body><p>" + bodyText + "</p></body></html>";
        return sendEmail(toEmail, subject, html);
    }

    @Async
    public void sendValidationEmailAsync(String email, String url) {
        try {
            sendValidationEmail(email, url);
        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
        }
    }

    public boolean sendValidationEmail(String toEmail, String validationUrl) {
        String html = "<html><body>"
            + "<h3>Welcome!</h3>"
            + "<p>Click the button below to validate your account:</p>"
            + "<a href='" + validationUrl + "' style=\""
            + "display:inline-block;"
            + "padding:10px 20px;"
            + "font-size:16px;"
            + "color:#ffffff;"
            + "background-color:#2563c7;"
            + "text-decoration:none;"
            + "border-radius:5px;"
            + "\">Validate Account</a>"
            + "<p>If you didn't register, you can ignore this email.</p>"
            + "</body></html>";
        return sendEmail(toEmail, "Please validate your account", html);
    }

    public void sendResetOtpEmail(String toEmail, String otp) {
        String html = "<html><body>"
            + "<p>Votre code de verification est: <strong>" + otp + "</strong></p>"
            + "</body></html>";
        sendEmail(toEmail, "Password Reset", html);
    }
}



