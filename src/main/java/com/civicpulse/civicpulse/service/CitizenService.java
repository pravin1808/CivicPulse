package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.model.Category;
import com.civicpulse.civicpulse.model.Issue;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.IssueDashboardResponseDto;
import com.civicpulse.civicpulse.model.dto.IssueRequestDto;
import com.civicpulse.civicpulse.model.dto.IssueResponseDto;
import com.civicpulse.civicpulse.model.dto.SingleIssueResponseDto;
import com.civicpulse.civicpulse.repository.jpa.CategoryRepo;
import com.civicpulse.civicpulse.repository.jpa.IssueRepo;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

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

    public List<IssueDashboardResponseDto> getAllIssues(String email){

        List<Issue> allIssues = issueRepo.findByCitizenId(userRepo.findUserByEmail(email).getId());
        List<IssueDashboardResponseDto> issueDashboardResponseDtos = new ArrayList<>();
        for(Issue issue : allIssues){
            IssueDashboardResponseDto issueDashboardResponseDto = new IssueDashboardResponseDto(
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
                    issue.getCitizen()
            );
            issueDashboardResponseDtos.add(issueDashboardResponseDto);
        }
        return issueDashboardResponseDtos;
    }

    public SingleIssueResponseDto getIssueById(Authentication authentication, String issueId) {
        try {
            Issue issue = issueRepo.findByIssueId(issueId);
            if (issue.getCitizen().getEmail().equals(authentication.getName())) {
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
            } else {
                throw new RuntimeException("You are not allowed to see other citizens issue");
            }
        }catch (Exception e){
            throw new RuntimeException("Issue not found");
        }
    }

    public IssueResponseDto updateIssueById(IssueRequestDto issueRequestDto, Authentication authentication, MultipartFile imageFile) {
        Issue issue = issueRepo.findByIssueId(issueRequestDto.issue_id());

        User citizen = userRepo.findUserByEmail(authentication.getName());

        if(!citizen.getId().equals(issue.getCitizen().getId())){
            throw new RuntimeException("Yo are not eligible to edit the issue");
        }

        issue.setTitle(issueRequestDto.title());
        issue.setDescription(issueRequestDto.description());
        issue.setLatitude(issueRequestDto.latitude());
        issue.setLongitude(issueRequestDto.longitude());
        Category category = categoryRepo.findById(issueRequestDto.categoryId()).orElseThrow(() -> new RuntimeException("Category Not Found"));
        issue.setCategory(category);

        if(!imageFile.isEmpty()){
            try{
                Files.deleteIfExists(Path.of(issue.getImageUrl()));
                String imageUrl = imageService.saveImage(imageFile, "Before");
                issue.setImageUrl(imageUrl);
            }catch (Exception e){
                throw new RuntimeException("Some error occurred during deleting the image");
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
        Issue issue = issueRepo.findByIssueId(issueId);

        if(!issue.getCitizen().getEmail().equals(authentication.getName())){
            throw new RuntimeException("You are not eligible to edit this issue");
        }
        issueRepo.delete(issue);
    }
}
