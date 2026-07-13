package com.civicpulse.civicpulse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final RestClient restClient = RestClient.create();

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Async
    public void sendOtpMail(String targetEmail, String otpCode) {
        String brevoApiUrl = "https://api.brevo.com/v3/smtp/email";

        System.out.println(targetEmail);

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of("name", "CivicPulse", "email", "pravinm1808@gmail.com"),
                "to", List.of(Map.of("email", targetEmail)),
                "subject", "CivicPulse - Account Verification OTP",
                "htmlContent", "<h3>Welcome to CivicPulse!</h3>" +
                        "<p>Your 6-digit verification code is: <b>" + otpCode + "</b></p>" +
                        "<p>This code expires in 5 minutes.</p>"
        );

        try {
            restClient.post()
                    .uri(brevoApiUrl)
                    .header("api-key", brevoApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("Failed to send OTP email via Brevo: " + e.getMessage());
        }
    }
}
