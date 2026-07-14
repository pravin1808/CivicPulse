package com.civicpulse.civicpulse.controller;

import com.civicpulse.civicpulse.model.dto.IssueUpdateWorkerDto;
import com.civicpulse.civicpulse.model.dto.IssueWorkerResponseDto;
import com.civicpulse.civicpulse.service.WorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/worker")
public class WorkerController {

    @Autowired
    private WorkerService workerService;

    @GetMapping("/issues")
    public ResponseEntity<List<IssueWorkerResponseDto>> getAllIssuesOfWorker(Authentication authentication){
        return new ResponseEntity<>(workerService.getAllIssuesOfWorker(authentication), HttpStatus.FOUND);
    }

    @GetMapping("/issue/{issue_id}")
    public ResponseEntity<IssueWorkerResponseDto> getIssueById(@PathVariable String issue_id, Authentication authentication){
        return new ResponseEntity<>(workerService.getIssueOfWorkerById(authentication, issue_id), HttpStatus.FOUND);
    }

    @PatchMapping("/issue/{issue_id}")
    public ResponseEntity<?> updateIssueStatus(@RequestPart("issue_status") IssueUpdateWorkerDto issueUpdateDto,
                                               @RequestParam(value = "image", required = false) MultipartFile imageFile,
                                               @PathVariable String issue_id,
                                               Authentication authentication){
        return new ResponseEntity<>(workerService.updateIssueStatus(issueUpdateDto, issue_id, authentication, imageFile), HttpStatus.ACCEPTED);
    }

}
