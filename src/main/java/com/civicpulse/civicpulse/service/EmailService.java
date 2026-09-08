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

    private String brevoApiUrl = "https://api.brevo.com/v3/smtp/email";

    @Async
    public void sendOtpMail(String targetEmail, String otpCode) {
        sendOtpEmail(
                targetEmail,
                otpCode,
                "CivicPulse - Account Verification OTP",
                "<h3>Welcome to CivicPulse!</h3>"
        );
    }

    @Async
    public void sendPasswordResetOtpMail(String targetEmail, String otpCode) {
        sendOtpEmail(
                targetEmail,
                otpCode,
                "CivicPulse - Password Reset OTP",
                "<h3>Reset your CivicPulse password</h3>"
        );
    }

    /**
     * Sent to the citizen immediately after they successfully report a new issue.
     *
     * @param targetEmail citizen's email address
     * @param citizenName citizen's display name
     * @param issueId     application-level issue ID (e.g. "Issue - 42")
     * @param issueTitle  title of the reported issue
     */
    @Async
    public void sendIssueReportedMail(String targetEmail, String citizenName, String issueId, String issueTitle) {
        String subject = "CivicPulse - Issue Reported Successfully";
        String htmlContent =
                "<h3>Hi " + citizenName + ", your issue has been received!</h3>" +
                "<p>Thank you for reporting the following issue to us:</p>" +
                "<table style='border-collapse:collapse;'>" +
                "  <tr><td style='padding:4px 8px;font-weight:bold;'>Issue ID</td><td style='padding:4px 8px;'>" + issueId + "</td></tr>" +
                "  <tr><td style='padding:4px 8px;font-weight:bold;'>Title</td><td style='padding:4px 8px;'>" + issueTitle + "</td></tr>" +
                "</table>" +
                "<p>Our team will review your report and assign it to the appropriate department shortly.</p>" +
                "<p>You can track the status of your issue at any time from your CivicPulse dashboard.</p>" +
                "<br><p>Thank you for helping build a better city!<br><strong>— The CivicPulse Team</strong></p>";

        sendHtmlEmail(targetEmail, subject, htmlContent);
    }

    /**
     * Sent to the citizen whenever their issue is updated — either by themselves, a worker, or the admin.
     *
     * @param targetEmail citizen's email address
     * @param citizenName citizen's display name
     * @param issueId     application-level issue ID
     * @param issueTitle  title of the issue
     * @param newStatus   the new status string (e.g. PENDING, IN_PROGRESS, RESOLVED)
     */
    @Async
    public void sendIssueUpdatedMail(String targetEmail, String citizenName, String issueId, String issueTitle, String newStatus) {
        String subject = "CivicPulse - Issue Status Updated";
        String htmlContent =
                "<h3>Hi " + citizenName + ", your issue has been updated!</h3>" +
                "<p>Here is the latest status for your reported issue:</p>" +
                "<table style='border-collapse:collapse;'>" +
                "  <tr><td style='padding:4px 8px;font-weight:bold;'>Issue ID</td><td style='padding:4px 8px;'>" + issueId + "</td></tr>" +
                "  <tr><td style='padding:4px 8px;font-weight:bold;'>Title</td><td style='padding:4px 8px;'>" + issueTitle + "</td></tr>" +
                "  <tr><td style='padding:4px 8px;font-weight:bold;'>New Status</td><td style='padding:4px 8px;'>" + newStatus + "</td></tr>" +
                "</table>" +
                "<p>You can view the full details from your CivicPulse dashboard.</p>" +
                "<br><p>Thank you for your patience.<br><strong>— The CivicPulse Team</strong></p>";

        sendHtmlEmail(targetEmail, subject, htmlContent);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void sendOtpEmail(String targetEmail, String otpCode, String subject, String heading) {
        String htmlContent = heading +
                "<p>Your 6-digit verification code is: <b>" + otpCode + "</b></p>" +
                "<p>This code expires in 5 minutes.</p>";
        sendHtmlEmail(targetEmail, subject, htmlContent);
    }

    private void sendHtmlEmail(String targetEmail, String subject, String htmlContent) {
        Map<String, Object> requestBody = Map.of(
                "sender", Map.of("name", "CivicPulse", "email", "pravinm1808@gmail.com"),
                "to", List.of(Map.of("email", targetEmail)),
                "subject", subject,
                "htmlContent", htmlContent
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
            System.err.println("Failed to send email via Brevo: " + e.getMessage());
        }
    }
}
