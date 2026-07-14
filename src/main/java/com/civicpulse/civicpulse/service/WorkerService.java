package com.civicpulse.civicpulse.service;

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
        List<Issue> allIssuesOfWorker = issueRepo.findAvailableIssuesForWorker(worker.getDepartmentId(), worker.getId());

        List<IssueWorkerResponseDto> allIssues = new ArrayList<>();
        for(Issue issue : allIssuesOfWorker){
            IssueWorkerResponseDto workerIssue = new IssueWorkerResponseDto(
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
            allIssues.add(workerIssue);
        }
        return allIssues;
    }

    public IssueWorkerResponseDto getIssueOfWorkerById(Authentication authentication, String issueId) {
        try {
            Issue issue = issueRepo.findByIssueId(issueId);
            User worker = userRepo.findUserByEmail(authentication.getName());
            if (!Objects.equals(issue.getCitizen().getId(), worker.getId())) {
                throw new RuntimeException("You are allowed to see this Issue");
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
        }catch (Exception e){
            throw new RuntimeException("Issue not found");
        }
    }

    public IssueWorkerResponseDto updateIssueStatus(IssueUpdateWorkerDto issueUpdateDto, String issueId, Authentication authentication, MultipartFile imageFile) {
        try{
            Issue issue = issueRepo.findByIssueId(issueId);
            User worker = userRepo.findUserByEmail(authentication.getName());
            if(!Objects.equals(issue.getCitizen().getId(), worker.getId())){
                throw new RuntimeException("You are not allowed to update this issue");
            }

            if(issueUpdateDto.status()==null){
                throw new RuntimeException("Provide the status to modify the issue");
            }
            if ((issueUpdateDto.status() == IssueStatus.RESOLVED)) {
                if(imageFile.isEmpty()){
                    throw new RuntimeException("After Image is required to show the status of issue as resolved");
                }else{
                    String imageUrl = imageService.saveImage(imageFile, "After");
                    issue.setAfterImageURl(imageUrl);
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

        } catch (Exception e) {
            throw new RuntimeException("Unable to update issue");
        }
    }
}
