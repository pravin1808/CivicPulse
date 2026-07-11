package com.civicpulse.civicpulse.model.dto;

public record CitizenRequestDto(
        String name,
        String phoneNumber,
        String email,
        String address,
        String password
) {
}
