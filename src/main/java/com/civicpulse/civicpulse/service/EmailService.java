package com.civicpulse.civicpulse.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendOtpMail(String toMail, String otp){
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom("noreply@civicpulse.gov.in");
        message.setTo(toMail);
        message.setSubject("CivicPulse - Complete Your Registration");

        String emailBody = "Hello,\n\n"
                + "Thank you for registering on CivicPulse, your city's governance platform.\n"
                + "Your One-Time Password (OTP) for verification is:\n\n"
                + "   " + otp + "\n\n"
                + "This OTP is strictly confidential and will expire automatically in 2 minutes.\n"
                + "If you did not initiate this registration, please ignore this email.\n\n"
                + "Regards,\n"
                + "CivicPulse Administration Team";

        message.setText(emailBody);

        mailSender.send(message);
    }

}
