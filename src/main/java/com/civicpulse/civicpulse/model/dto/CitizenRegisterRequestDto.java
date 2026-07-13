package com.civicpulse.civicpulse.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CitizenRegisterRequestDto(
        @NotBlank String name,
        @Email String phoneNumber,
        @NotBlank String email,
        @NotBlank String address,
        @NotBlank String password
) {
}
