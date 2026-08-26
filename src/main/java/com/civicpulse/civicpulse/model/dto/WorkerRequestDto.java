package com.civicpulse.civicpulse.model.dto;

import jakarta.validation.constraints.*;

public record WorkerRequestDto(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit Indian mobile number")
        String phoneNumber,

        @NotBlank(message = "Address is required")
        @Size(max = 255, message = "Address must not exceed 255 characters")
        String address,

        @NotNull(message = "Department ID is required")
        @Positive(message = "Department ID must be a positive number")
        Long dept_id
) {
}
