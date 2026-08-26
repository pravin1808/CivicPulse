package com.civicpulse.civicpulse.model.dto;

import jakarta.validation.constraints.*;

public record WorkerRegisterRequestDto(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit Indian mobile number")
        String phoneNumber,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        String email,

        @NotBlank(message = "Address is required")
        @Size(max = 255, message = "Address must not exceed 255 characters")
        String address,

        @NotBlank(message = "Password is required")
        String password,

        @NotNull(message = "Department ID is required")
        @Positive(message = "Department ID must be a positive number")
        Long dept_id
) {
}
