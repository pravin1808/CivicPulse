package com.civicpulse.civicpulse.model.dto;

public record UserRequestDto(
        String name,
        String phoneNumber,
        String email,
        String password
) {
}
