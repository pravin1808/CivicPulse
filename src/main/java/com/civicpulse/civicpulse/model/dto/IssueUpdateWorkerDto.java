package com.civicpulse.civicpulse.model.dto;

import com.civicpulse.civicpulse.model.IssueStatus;
import jakarta.validation.constraints.NotNull;

public record IssueUpdateWorkerDto(
        @NotNull(message = "Status is required")
        IssueStatus status
) {
}
