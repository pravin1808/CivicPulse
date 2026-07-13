package com.civicpulse.civicpulse.model.dto;

import com.civicpulse.civicpulse.model.IssueStatus;
import com.civicpulse.civicpulse.model.User;

import java.time.LocalDateTime;

public record IssueDashboardResponseDto(
        String issueId,
        String title,
        String description,
        IssueStatus status,
        Double latitude,
        Double longitude,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long department,
        Long category,
        User citizen
) {
}
