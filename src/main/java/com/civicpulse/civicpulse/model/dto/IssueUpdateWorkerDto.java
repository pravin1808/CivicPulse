package com.civicpulse.civicpulse.model.dto;

import com.civicpulse.civicpulse.model.IssueStatus;

public record IssueUpdateWorkerDto(
        IssueStatus status
) {
}
