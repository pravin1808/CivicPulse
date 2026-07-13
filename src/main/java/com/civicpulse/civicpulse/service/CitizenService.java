package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.model.Issue;
import com.civicpulse.civicpulse.model.dto.IssueDashboardResponseDto;
import com.civicpulse.civicpulse.repository.jpa.IssueRepo;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CitizenService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private IssueRepo issueRepo;

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

}
