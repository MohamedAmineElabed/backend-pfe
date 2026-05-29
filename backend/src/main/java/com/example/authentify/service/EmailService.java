//JavaMailSender
/*package com.example.authentify.service;

import org.springframework.stereotype.Service;

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


//Brevo API
package com.example.authentify.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import sendinblue.ApiClient;
import sendinblue.ApiException;
import sendinblue.Configuration;
import sendinblue.auth.ApiKeyAuth;
import sibApi.TransactionalEmailsApi;
import sibModel.CreateSmtpEmail;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;

import java.util.List;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    private final String fromEmail = "mohamedamineelabed2015@gmail.com";
    private final String fromName = "PFE App";

    // ── internal helper ────────────────────────────────────────────────────────

    private TransactionalEmailsApi buildApi() {
        ApiClient client = Configuration.getDefaultApiClient();
        ApiKeyAuth auth = (ApiKeyAuth) client.getAuthentication("api-key");
        auth.setApiKey(brevoApiKey);
        return new TransactionalEmailsApi();
    }

    private boolean sendHtml(String toEmail, String subject, String htmlContent) {
        try {
            SendSmtpEmail email = new SendSmtpEmail();

            SendSmtpEmailSender sender = new SendSmtpEmailSender();
            sender.setEmail(fromEmail);
            sender.setName(fromName);
            email.setSender(sender);

            SendSmtpEmailTo recipient = new SendSmtpEmailTo();
            recipient.setEmail(toEmail.trim());
            email.setTo(List.of(recipient));

            email.setSubject(subject);
            email.setHtmlContent(htmlContent);

            buildApi().sendTransacEmail(email);
            System.out.println("Email sent successfully to " + toEmail);
            return true;

        } catch (ApiException e) {
            System.out.println("Brevo status code: " + e.getCode());
            System.out.println("Brevo response: " + e.getResponseBody());
            e.printStackTrace();
            return false;
}
    }

    private boolean sendText(String toEmail, String subject, String textContent) {
        return sendHtml(toEmail, subject,
                "<html><body><p>" + textContent.replace("\n", "<br>") + "</p></body></html>");
    }

// ── public API ─────────────────────────────────────────────────────────────
    public boolean sendWelcomeEmail(String toEmail, String subject, String body) {
        if (toEmail == null || !toEmail.contains("@")) {
            System.out.println("Invalid email address");
            return false;
        }
        return sendText(toEmail, subject, body);
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
        if (toEmail == null || !toEmail.contains("@")) {
            System.out.println("Invalid email address");
            return false;
        }

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

        return sendHtml(toEmail, "Please validate your account", htmlContent);
    }

    public void sendResetOtpEmail(String toEmail, String otp) {
        sendText(toEmail, "Password Reset",
                "Votre code de verification est: " + otp);
    }
}





