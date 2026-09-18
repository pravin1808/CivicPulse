package com.civicpulse.civicpulse.model.dto;

import com.civicpulse.civicpulse.model.Role;

public record CitizenProfileResponseDto(
        Long id,
        String name,
        String email,
        String phoneNumber,
        String address,
        Role role
) {
}
