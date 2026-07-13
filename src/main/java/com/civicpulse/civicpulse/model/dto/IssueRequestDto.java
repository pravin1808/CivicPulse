package com.civicpulse.civicpulse.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IssueRequestDto(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull Double latitude,
        @NotNull Double longitude,
        @NotNull Long categoryId
) {
}
