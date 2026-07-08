package com.civicpulse.civicpulse.model.dto;

public record OtpRequestDto(
        String email,
        String otp
) {
}
