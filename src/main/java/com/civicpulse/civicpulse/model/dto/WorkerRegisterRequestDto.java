package com.civicpulse.civicpulse.model.dto;

public record WorkerRegisterRequestDto(
        String name,
        String phoneNumber,
        String email,
        String address,
        String password,
        Long dept_id
) {
}
