package com.civicpulse.civicpulse.model.dto;

import com.civicpulse.civicpulse.model.IssueStatus;
import jakarta.validation.constraints.NotNull;

public record AdminUpdateIssueRequestDto(
        Long workerId,
        @NotNull IssueStatus status
) {
}
