package com.civicpulse.civicpulse.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PasswordResetRequestDto(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        String email,

        @NotBlank(message = "OTP is required")
        @Pattern(regexp = "^\\d{6}$", message = "OTP must be exactly 6 digits")
        String otp,

        @NotBlank(message = "New password is required")
        @Pattern(
                regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,20}$",
                message = "Password must be 8-20 characters long and include uppercase, lowercase, digit, and special character."
        )
        String newPassword
) { }
