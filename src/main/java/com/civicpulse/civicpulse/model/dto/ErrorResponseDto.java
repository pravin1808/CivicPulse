package com.civicpulse.civicpulse.model.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record ErrorResponseDto(
        int status,
        String error,
        String message,
        LocalDateTime timestamp,
        Map<String, List<String>> fieldErrors
) {
    public ErrorResponseDto(int status, String error, String message) {
        this(status, error, message, LocalDateTime.now(), Map.of());
    }

    public ErrorResponseDto(int status, String error, String message, Map<String, List<String>> fieldErrors) {
        this(status, error, message, LocalDateTime.now(), fieldErrors);
    }
}
