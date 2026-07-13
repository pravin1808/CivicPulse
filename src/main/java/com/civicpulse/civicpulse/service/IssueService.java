package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.model.Category;
import com.civicpulse.civicpulse.model.Issue;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.IssueRequestDto;
import com.civicpulse.civicpulse.model.dto.IssueResponseDto;
import com.civicpulse.civicpulse.repository.jpa.CategoryRepo;
import com.civicpulse.civicpulse.repository.jpa.IssueRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class IssueService {

    @Autowired
    private IssueRepo issueRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Transactional
    public IssueResponseDto createIssue(IssueRequestDto issueRequestDto, String imageUrl, User citizen){
        Issue newIssue = new Issue();
        newIssue.setTitle(issueRequestDto.title());
        newIssue.setDescription(issueRequestDto.description());
        newIssue.setImageUrl(imageUrl);
        newIssue.setLatitude(issueRequestDto.latitude());
        newIssue.setLongitude(issueRequestDto.longitude());
        newIssue.setCreatedAt(LocalDateTime.now());

        Category category = categoryRepo.findById(issueRequestDto.categoryId()).orElseThrow(() -> new RuntimeException("category not found"));
        newIssue.setCategory(category);
        newIssue.setCitizen(citizen);

        Issue createdIssue = issueRepo.save(newIssue);
        createdIssue.setIssueId("Issue: "+createdIssue.getId());
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
