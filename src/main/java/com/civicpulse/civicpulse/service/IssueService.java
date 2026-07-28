package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.model.Category;
import com.civicpulse.civicpulse.model.Issue;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.IssueRegisterDto;
import com.civicpulse.civicpulse.model.dto.IssueResponseDto;
import com.civicpulse.civicpulse.repository.jpa.CategoryRepo;
import com.civicpulse.civicpulse.repository.jpa.IssueRepo;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
public class IssueService {

    @Autowired
    private ImageService imageService;

    @Autowired
    private IssueRepo issueRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private UserRepo userRepo;

    @Transactional
    public IssueResponseDto createIssue(@Valid IssueRegisterDto issueRegisterDto, MultipartFile imageFile, Authentication authentication) throws Exception {
        String email = authentication.getName();
        User citizen = userRepo.findUserByEmail(email);


        Issue newIssue = new Issue();
        newIssue.setTitle(issueRegisterDto.title());
        newIssue.setDescription(issueRegisterDto.description());
        newIssue.setLatitude(issueRegisterDto.latitude());
        newIssue.setLongitude(issueRegisterDto.longitude());
        newIssue.setCreatedAt(LocalDateTime.now());

        Category category = categoryRepo.findById(issueRegisterDto.categoryId()).orElseThrow(() -> new RuntimeException("category not found"));
        newIssue.setCategory(category);
        newIssue.setCitizen(citizen);

        Issue createdIssue = issueRepo.save(newIssue);
        createdIssue.setIssueId("Issue - "+createdIssue.getId());
        String imageUrl = imageService.saveImage(issueRegisterDto.categoryId(), createdIssue.getIssueId(), imageFile, "Before ");
        newIssue.setImageUrl(imageUrl);
        Issue updated  = issueRepo.save(createdIssue);

        return new IssueResponseDto(
                updated.getIssueId(),
                updated.getTitle(),
                updated.getDescription(),
                updated.getStatus(),
                updated.getCreatedAt(),
                updated.getUpdatedAt()
        );
    }

}
