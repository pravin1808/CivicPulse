package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.exception.InvalidOtpException;
import com.civicpulse.civicpulse.exception.OtpExpiredException;
import com.civicpulse.civicpulse.exception.ResourceNotFoundException;
import com.civicpulse.civicpulse.model.Role;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.cache.TemporaryUser;
import com.civicpulse.civicpulse.model.dto.CitizenRegisterRequestDto;
import com.civicpulse.civicpulse.model.dto.OtpRequestDto;
import com.civicpulse.civicpulse.model.dto.PasswordResetRequestDto;
import com.civicpulse.civicpulse.repository.redis.TemporaryUserRepo;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private static final int PASSWORD_RESET_OTP_EXPIRY_MINUTES = 5;
    private static final int PASSWORD_RESET_RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_PASSWORD_RESET_OTP_ATTEMPTS = 5;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TemporaryUserRepo tempUserRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public void addNewUser(CitizenRegisterRequestDto citizenRegisterRequestDto) {
        SecureRandom random = new SecureRandom();
        String otp = String.valueOf(100000 + random.nextInt(900000));
        TemporaryUser tempUser = new TemporaryUser(
                citizenRegisterRequestDto.email(),
                citizenRegisterRequestDto.name(),
                citizenRegisterRequestDto.phoneNumber(),
                citizenRegisterRequestDto.address(),
                bCryptPasswordEncoder.encode(citizenRegisterRequestDto.password()),
                otp
        );
        tempUserRepo.save(tempUser);
        emailService.sendOtpMail(tempUser.getEmail(), tempUser.getOtp());
    }

    public String verifyAndRegisterUser(String email, String otp) {
        Optional<TemporaryUser> cachedUser = tempUserRepo.findById(email);
        if (cachedUser.isEmpty()) {
            return "SESSION_EXPIRED";
        }
        TemporaryUser temporaryUser = cachedUser.get();
        if (!temporaryUser.getOtp().equals(otp)) {
            return "INVALID_OTP";
        }
        User finalizedUser = new User();
        finalizedUser.setName(temporaryUser.getName());
        finalizedUser.setEmail(temporaryUser.getEmail());
        finalizedUser.setPhoneNumber(temporaryUser.getPhoneNumber());
        finalizedUser.setAddress(temporaryUser.getAddress());
        finalizedUser.setPassword(temporaryUser.getBCryptedPassword());
        finalizedUser.setRole(Role.CITIZEN);
        finalizedUser.setEnabled(true);
        userRepo.save(finalizedUser);
        // Clean up the Redis cache immediately so the RAM is freed up right away
        tempUserRepo.deleteById(email);
        return "SUCCESS";
    }

    public boolean checkIfUserExist(String email) {
        User user = userRepo.findUserByEmail(email);
        return user != null;
    }

    public Role whatRole(String email) {
        User user = userRepo.findUserByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }
        return user.getRole();
    }

    public void forgotPasswordOtpRequest(String email) {
        User user = userRepo.findUserByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("No account is registered with this email address.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (user.getOtpRequestedAt() != null
                && now.isBefore(user.getOtpRequestedAt().plusSeconds(PASSWORD_RESET_RESEND_COOLDOWN_SECONDS))) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait one minute before requesting another OTP."
            );
        }

        SecureRandom random = new SecureRandom();
        String otp = String.valueOf(100000 + random.nextInt(900000));
        user.setOtp(bCryptPasswordEncoder.encode(otp));
        user.setOtpRequestedAt(now);
        user.setOtpExpTime(now.plusMinutes(PASSWORD_RESET_OTP_EXPIRY_MINUTES));
        user.setOtpAttemptCount(0);
        userRepo.save(user);
        emailService.sendPasswordResetOtpMail(email, otp);
    }

    public void resetPassword(PasswordResetRequestDto passwordResetRequestDto) {
        User user = userRepo.findUserByEmail(passwordResetRequestDto.email());
        if (user == null) {
            throw new ResourceNotFoundException("No account is registered with this email address.");
        }
        if (user.getOtp() == null || user.getOtpExpTime() == null) {
            throw new InvalidOtpException("No active password-reset OTP was requested for this account.");
        }
        if (LocalDateTime.now().isAfter(user.getOtpExpTime())) {
            clearPasswordResetOtp(user);
            userRepo.save(user);
            throw new OtpExpiredException("This OTP has expired. Please request a new one.");
        }
        if (!bCryptPasswordEncoder.matches(passwordResetRequestDto.otp(), user.getOtp())) {
            int attempts = user.getOtpAttemptCount() + 1;
            user.setOtpAttemptCount(attempts);
            if (attempts >= MAX_PASSWORD_RESET_OTP_ATTEMPTS) {
                clearPasswordResetOtp(user);
                userRepo.save(user);
                throw new InvalidOtpException("Too many invalid OTP attempts. Please request a new OTP.");
            }
            userRepo.save(user);
            throw new InvalidOtpException("Invalid OTP. Please check and try again.");
        }

        user.setPassword(bCryptPasswordEncoder.encode(passwordResetRequestDto.newPassword()));
        clearPasswordResetOtp(user);
        userRepo.save(user);
    }

    private void clearPasswordResetOtp(User user) {
        user.setOtp(null);
        user.setOtpExpTime(null);
        user.setOtpRequestedAt(null);
        user.setOtpAttemptCount(0);
    }
}
