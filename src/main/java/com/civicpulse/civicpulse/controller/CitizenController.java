package com.civicpulse.civicpulse.controller;

import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.IssueDashboardResponseDto;
import com.civicpulse.civicpulse.model.dto.IssueRequestDto;
import com.civicpulse.civicpulse.model.dto.IssueResponseDto;
import com.civicpulse.civicpulse.model.dto.SingleIssueResponseDto;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import com.civicpulse.civicpulse.service.CitizenService;
import com.civicpulse.civicpulse.service.ImageService;
import com.civicpulse.civicpulse.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("api/citizen")
public class CitizenController {

    @Autowired
    private IssueService issueService;

    @Autowired
    private ImageService imageService;

    @Autowired
    private CitizenService citizenService;

    @Autowired
    private UserRepo userRepo;

    @PostMapping(value = "/issue", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> reportNewIssue(
            @Valid @RequestPart("issue") IssueRequestDto issueRequestDto,
            @Valid @RequestParam(value = "image", required = false) MultipartFile imageFile,
            Authentication authentication) throws Exception {

        String email = authentication.getName();
        User currentUser = userRepo.findUserByEmail(email);
        String imageUrl = imageService.saveImage(imageFile, "Before ");
        return new ResponseEntity<>(issueService.createIssue(issueRequestDto, imageUrl, currentUser), HttpStatus.CREATED);
    }

    @GetMapping("issues")
    public ResponseEntity<List<IssueDashboardResponseDto>> getAll(Authentication authentication){
        return new ResponseEntity<>(citizenService.getAllIssues(authentication.getName()), HttpStatus.FOUND);
    }

    @GetMapping("/issue/{issue_id}")
    public ResponseEntity<SingleIssueResponseDto> getIssueById(@PathVariable String issue_id, Authentication authentication){
        return new ResponseEntity<>(citizenService.getIssueById(authentication, issue_id), HttpStatus.FOUND);
    }

    @PutMapping("/issue")
    public ResponseEntity<IssueResponseDto> updateIssueById(@RequestPart("issue") IssueRequestDto issueRequestDto,
                                                            Authentication authentication,
                                                            @RequestParam(value = "image", required = false) MultipartFile imageFile){
        return new ResponseEntity<>(citizenService.updateIssueById(issueRequestDto, authentication, imageFile), HttpStatus.FOUND);
    }

    @DeleteMapping("/issue/{issue_id}")
    public ResponseEntity<?> deleteIssueById(Authentication authentication, @PathVariable String issue_id){
        citizenService.deleteIssueById(authentication,issue_id);
        return new ResponseEntity<>("Issue Deleted Successfully", HttpStatus.OK);
    }

}
