package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.exception.AccessForbiddenException;
import com.civicpulse.civicpulse.exception.ResourceNotFoundException;
import com.civicpulse.civicpulse.model.Category;
import com.civicpulse.civicpulse.model.Issue;
import com.civicpulse.civicpulse.model.JwtPrincipal;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.*;
import com.civicpulse.civicpulse.repository.jpa.CategoryRepo;
import com.civicpulse.civicpulse.repository.jpa.IssueRepo;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CitizenService {

    @Autowired
    private ImageService imageService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private IssueRepo issueRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    public List<IssueDashboardResponseDto> getAllIssues(Long citizenId) {
        List<Issue> allIssues = issueRepo.findByCitizenId(citizenId);
        List<IssueDashboardResponseDto> issueDashboardResponseDtos = new ArrayList<>();

        for (Issue issue : allIssues) {
            issueDashboardResponseDtos.add(new IssueDashboardResponseDto(
                    issue.getIssueId(),
                    issue.getTitle(),
                    issue.getDescription(),
                    issue.getStatus(),
                    issue.getLatitude(),
                    issue.getLongitude(),
                    issue.getCreatedAt(),
                    issue.getUpdatedAt(),
                    issue.getCategory().getDepartment().getId(),
                    issue.getCategory().getId(),
                    new IssuesCitizenDto(
                            issue.getCitizen().getId(),
                            issue.getCitizen().getName(),
                            issue.getCitizen().getEmail(),
                            issue.getCitizen().getPhoneNumber()
                    )
            ));
        }
        return issueDashboardResponseDtos;
    }

    public SingleIssueResponseDto getIssueById(Authentication authentication, String issueId) {
        Issue issue = Optional.ofNullable(issueRepo.findByIssueId(issueId))
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with ID: " + issueId));

        JwtPrincipal principal = (JwtPrincipal) authentication.getPrincipal();
        if (!principal.userId().equals(issue.getCitizen().getId())) {
            throw new AccessForbiddenException("You are not allowed to view another citizen's issue.");
        }

        return new SingleIssueResponseDto(
                issue.getIssueId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus(),
                issue.getCreatedAt(),
                issue.getUpdatedAt(),
                issue.getImageUrl(),
                issue.getAfterImageURl()
        );
    }

    public IssueResponseDto updateIssueById(IssueRequestDto issueRequestDto, Authentication authentication, MultipartFile imageFile) {
        Issue issue = Optional.ofNullable(issueRepo.findByIssueId(issueRequestDto.issue_id()))
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with ID: " + issueRequestDto.issue_id()));

        // Read userId from JwtPrincipal — no DB call needed
        JwtPrincipal principal = (JwtPrincipal) authentication.getPrincipal();
        if (!principal.userId().equals(issue.getCitizen().getId())) {
            throw new AccessForbiddenException("You are not eligible to edit this issue.");
        }

        issue.setTitle(issueRequestDto.title());
        issue.setDescription(issueRequestDto.description());
        issue.setLatitude(issueRequestDto.latitude());
        issue.setLongitude(issueRequestDto.longitude());

        Category category = categoryRepo.findById(issueRequestDto.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + issueRequestDto.categoryId()));
        issue.setCategory(category);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                Files.deleteIfExists(Path.of(issue.getImageUrl()));
                String imageUrl = imageService.saveImage(issue.getCategory().getId(), issue.getIssueId(), imageFile, "Before");
                issue.setImageUrl(imageUrl);
            } catch (Exception e) {
                throw new ResourceNotFoundException("Error occurred while replacing the issue image.");
            }
        }

        Issue updatedIssue = issueRepo.save(issue);

        return new IssueResponseDto(
                updatedIssue.getIssueId(),
                updatedIssue.getTitle(),
                updatedIssue.getDescription(),
                updatedIssue.getStatus(),
                updatedIssue.getCreatedAt(),
                updatedIssue.getUpdatedAt()
        );
    }

    public void deleteIssueById(Authentication authentication, String issueId) {
        Issue issue = Optional.ofNullable(issueRepo.findByIssueId(issueId))
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with ID: " + issueId));

        JwtPrincipal principal = (JwtPrincipal) authentication.getPrincipal();
        if (!principal.userId().equals(issue.getCitizen().getId())) {
            throw new AccessForbiddenException("You are not eligible to delete this issue.");
        }
        issueRepo.delete(issue);
    }
}
