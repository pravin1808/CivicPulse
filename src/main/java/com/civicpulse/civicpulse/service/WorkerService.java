package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.exception.AccessForbiddenException;
import com.civicpulse.civicpulse.exception.InvalidImageException;
import com.civicpulse.civicpulse.exception.ResourceNotFoundException;
import com.civicpulse.civicpulse.model.Issue;
import com.civicpulse.civicpulse.model.IssueStatus;
import com.civicpulse.civicpulse.model.JwtPrincipal;
import com.civicpulse.civicpulse.model.dto.IssueUpdateWorkerDto;
import com.civicpulse.civicpulse.model.dto.IssueWorkerResponseDto;
import com.civicpulse.civicpulse.repository.jpa.IssueRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class WorkerService {

    @Autowired
    private ImageService imageService;

    @Autowired
    private IssueRepo issueRepo;

    public List<IssueWorkerResponseDto> getAllIssuesOfWorker(Authentication authentication) {
        // Read worker identity from JwtPrincipal — no DB call needed
        JwtPrincipal principal = (JwtPrincipal) authentication.getPrincipal();

        List<Issue> allIssuesOfWorker = issueRepo.findAvailableIssuesForWorker(principal.departmentId(), principal.userId());
        List<IssueWorkerResponseDto> allIssues = new ArrayList<>();

        for (Issue issue : allIssuesOfWorker) {
            allIssues.add(new IssueWorkerResponseDto(
                    issue.getIssueId(),
                    issue.getTitle(),
                    issue.getDescription(),
                    issue.getStatus(),
                    issue.getImageUrl(),
                    issue.getLatitude(),
                    issue.getLongitude(),
                    issue.getCategory().getId(),
                    issue.getAfterImageURl()
            ));
        }
        return allIssues;
    }

    public IssueWorkerResponseDto getIssueOfWorkerById(Authentication authentication, String issueId) {
        Issue issue = Optional.ofNullable(issueRepo.findByIssueId(issueId))
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with ID: " + issueId));

        // Read worker identity from JwtPrincipal — no DB call needed
        JwtPrincipal principal = (JwtPrincipal) authentication.getPrincipal();

        if (!Objects.equals(issue.getWorker() != null ? issue.getWorker().getId() : null, principal.userId())) {
            throw new AccessForbiddenException("You are not allowed to view this issue.");
        }

        return new IssueWorkerResponseDto(
                issue.getIssueId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus(),
                issue.getImageUrl(),
                issue.getLatitude(),
                issue.getLongitude(),
                issue.getCategory().getId(),
                issue.getAfterImageURl()
        );
    }

    public IssueWorkerResponseDto updateIssueStatus(IssueUpdateWorkerDto issueUpdateDto, String issueId, Authentication authentication, MultipartFile imageFile) {
        Issue issue = Optional.ofNullable(issueRepo.findByIssueId(issueId))
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with ID: " + issueId));

        // Read worker identity from JwtPrincipal — no DB call needed
        JwtPrincipal principal = (JwtPrincipal) authentication.getPrincipal();

        if (issue.getWorker() == null || !Objects.equals(issue.getWorker().getId(), principal.userId())) {
            throw new AccessForbiddenException("You are not allowed to update this issue.");
        }

        if (issueUpdateDto.status() == IssueStatus.RESOLVED) {
            if (imageFile == null || imageFile.isEmpty()) {
                throw new InvalidImageException("Upload a resolution image before marking the issue as resolved.");
            }
            String imageUrl = imageService.saveImage(issue.getCategory().getId(), issue.getIssueId(), imageFile, "After");
            issue.setAfterImageURl(imageUrl);
        }

        issue.setStatus(issueUpdateDto.status());
        Issue updatedIssue = issueRepo.save(issue);

        return new IssueWorkerResponseDto(
                updatedIssue.getIssueId(),
                updatedIssue.getTitle(),
                updatedIssue.getDescription(),
                updatedIssue.getStatus(),
                updatedIssue.getImageUrl(),
                updatedIssue.getLatitude(),
                updatedIssue.getLongitude(),
                updatedIssue.getCategory().getId(),
                updatedIssue.getAfterImageURl()
        );
    }
}
