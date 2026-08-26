package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.exception.AccessForbiddenException;
import com.civicpulse.civicpulse.exception.ResourceNotFoundException;
import com.civicpulse.civicpulse.model.Issue;
import com.civicpulse.civicpulse.model.IssueStatus;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.IssueUpdateWorkerDto;
import com.civicpulse.civicpulse.model.dto.IssueWorkerResponseDto;
import com.civicpulse.civicpulse.repository.jpa.IssueRepo;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
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
    private UserRepo userRepo;

    @Autowired
    private IssueRepo issueRepo;

    public List<IssueWorkerResponseDto> getAllIssuesOfWorker(Authentication authentication) {
        User worker = userRepo.findUserByEmail(authentication.getName());
        if (worker == null) {
            throw new ResourceNotFoundException("Authenticated worker not found.");
        }

        List<Issue> allIssuesOfWorker = issueRepo.findAvailableIssuesForWorker(worker.getDepartmentId(), worker.getId());
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

        User worker = userRepo.findUserByEmail(authentication.getName());
        if (worker == null) {
            throw new ResourceNotFoundException("Authenticated worker not found.");
        }

        if (!Objects.equals(issue.getWorker() != null ? issue.getWorker().getId() : null, worker.getId())) {
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

        User worker = userRepo.findUserByEmail(authentication.getName());
        if (worker == null) {
            throw new ResourceNotFoundException("Authenticated worker not found.");
        }

        if (issue.getWorker() == null || !Objects.equals(issue.getWorker().getId(), worker.getId())) {
            throw new AccessForbiddenException("You are not allowed to update this issue.");
        }

        if (issueUpdateDto.status() == IssueStatus.RESOLVED) {
            if (imageFile == null || imageFile.isEmpty()) {
                throw new IllegalArgumentException("An 'after' image is required to mark an issue as RESOLVED.");
            }
            try {
                String imageUrl = imageService.saveImage(issue.getCategory().getId(), issue.getIssueId(), imageFile, "After");
                issue.setAfterImageURl(imageUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to save the resolution image. Please try again.");
            }
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
