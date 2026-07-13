package com.civicpulse.civicpulse.model.dto;

import com.civicpulse.civicpulse.model.IssueStatus;
import java.time.LocalDateTime;

public record IssueResponseDto(
        String issueId, // ◄ The clean public string ID shown to the user
        String title,
        String description,
        IssueStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
