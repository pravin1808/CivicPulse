package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.exception.InvalidOtpException;
import com.civicpulse.civicpulse.exception.OtpExpiredException;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.PasswordResetRequestDto;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import com.civicpulse.civicpulse.repository.redis.TemporaryUserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
class AuthServicePasswordResetTests {

    private static final String EMAIL = "citizen@gmail.com";
    private static final String OTP = "123456";
    private static final String NEW_PASSWORD = "NewPass@123";

    @Mock
    private EmailService emailService;

    @Mock
    private TemporaryUserRepo temporaryUserRepo;

    @Mock
    private UserRepo userRepo;

    private BCryptPasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService();
        ReflectionTestUtils.setField(authService, "emailService", emailService);
        ReflectionTestUtils.setField(authService, "tempUserRepo", temporaryUserRepo);
        ReflectionTestUtils.setField(authService, "userRepo", userRepo);
        ReflectionTestUtils.setField(authService, "bCryptPasswordEncoder", passwordEncoder);
    }

    @Test
    void forgotPasswordStoresHashAndSendsTheMatchingOtp() {
        User user = userWithPassword("OldPass@123");
        when(userRepo.findUserByEmail(EMAIL)).thenReturn(user);

        authService.forgotPasswordOtpRequest(EMAIL);

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetOtpMail(eq(EMAIL), otpCaptor.capture());
        assertNotEquals(otpCaptor.getValue(), user.getOtp());
        assertTrue(passwordEncoder.matches(otpCaptor.getValue(), user.getOtp()));
        assertTrue(user.getOtpExpTime().isAfter(LocalDateTime.now()));
        assertEquals(0, user.getOtpAttemptCount());
        verify(userRepo).save(user);
    }

    @Test
    void validOtpResetsPasswordAndInvalidatesTheOtp() {
        User user = userWithPassword("OldPass@123");
        user.setOtp(passwordEncoder.encode(OTP));
        user.setOtpExpTime(LocalDateTime.now().plusMinutes(5));
        user.setOtpRequestedAt(LocalDateTime.now());
        when(userRepo.findUserByEmail(EMAIL)).thenReturn(user);

        authService.resetPassword(new PasswordResetRequestDto(EMAIL, OTP, NEW_PASSWORD));

        assertTrue(passwordEncoder.matches(NEW_PASSWORD, user.getPassword()));
        assertFalse(passwordEncoder.matches("OldPass@123", user.getPassword()));
        assertNull(user.getOtp());
        assertNull(user.getOtpExpTime());
        assertNull(user.getOtpRequestedAt());
        assertEquals(0, user.getOtpAttemptCount());
        verify(userRepo).save(user);
    }

    @Test
    void expiredOtpIsClearedAndCannotResetThePassword() {
        User user = userWithPassword("OldPass@123");
        user.setOtp(passwordEncoder.encode(OTP));
        user.setOtpExpTime(LocalDateTime.now().minusSeconds(1));
        when(userRepo.findUserByEmail(EMAIL)).thenReturn(user);

        assertThrows(OtpExpiredException.class,
                () -> authService.resetPassword(new PasswordResetRequestDto(EMAIL, OTP, NEW_PASSWORD)));

        assertTrue(passwordEncoder.matches("OldPass@123", user.getPassword()));
        assertNull(user.getOtp());
        assertNull(user.getOtpExpTime());
        verify(userRepo).save(user);
    }

    @Test
    void fifthInvalidOtpAttemptInvalidatesTheOtp() {
        User user = userWithPassword("OldPass@123");
        user.setOtp(passwordEncoder.encode(OTP));
        user.setOtpExpTime(LocalDateTime.now().plusMinutes(5));
        user.setOtpAttemptCount(4);
        when(userRepo.findUserByEmail(EMAIL)).thenReturn(user);

        InvalidOtpException exception = assertThrows(InvalidOtpException.class,
                () -> authService.resetPassword(new PasswordResetRequestDto(EMAIL, "000000", NEW_PASSWORD)));

        assertEquals("Too many invalid OTP attempts. Please request a new OTP.", exception.getMessage());
        assertNull(user.getOtp());
        assertNull(user.getOtpExpTime());
        assertEquals(0, user.getOtpAttemptCount());
        verify(userRepo, times(1)).save(user);
    }

    private User userWithPassword(String password) {
        User user = new User();
        user.setEmail(EMAIL);
        user.setPassword(passwordEncoder.encode(password));
        return user;
    }
}
