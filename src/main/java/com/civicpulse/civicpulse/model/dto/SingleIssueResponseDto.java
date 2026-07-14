package com.civicpulse.civicpulse.model.dto;

import com.civicpulse.civicpulse.model.IssueStatus;

import java.time.LocalDateTime;

public record SingleIssueResponseDto(
        String issueId,
        String title,
        String description,
        IssueStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String imageUrl,
        String afterImageUrl
) {
}
