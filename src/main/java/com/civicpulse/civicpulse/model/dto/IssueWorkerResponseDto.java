package com.civicpulse.civicpulse.model.dto;

import com.civicpulse.civicpulse.model.IssueStatus;

public record IssueWorkerResponseDto(
        String issue_id,
        String title,
        String description,
        IssueStatus status,
        String imageUrl,
        Double latitude,
        Double longitude,
        Long categoryId,
        String afterImageUrl
) {
}
