package com.civicpulse.civicpulse.model.dto;

public record WorkerRequestDto(
        String name,
        String phoneNumber,
        String address,
        Long dept_id
) {
}
