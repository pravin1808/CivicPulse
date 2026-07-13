package com.civicpulse.civicpulse.model.dto;

public record WorkerResponseDto(
        Long id,
        String name,
        String email,
        String phoneNumber,
        String address,
        Long dept_Id
) {
}
