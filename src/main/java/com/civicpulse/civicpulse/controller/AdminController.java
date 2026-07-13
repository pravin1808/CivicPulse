package com.civicpulse.civicpulse.controller;

import com.civicpulse.civicpulse.model.dto.AdminUpdateIssueRequestDto;
import com.civicpulse.civicpulse.model.dto.IssueDashboardResponseDto;
import com.civicpulse.civicpulse.model.dto.WorkerRegisterRequestDto;
import com.civicpulse.civicpulse.model.dto.WorkerResponseDto;
import com.civicpulse.civicpulse.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/worker_register")
    public ResponseEntity<?> workerRegistration(@Valid @RequestBody WorkerRegisterRequestDto workerRegisterRequestDto) {
        if (!AuthController.PasswordValidator.isValid(workerRegisterRequestDto.password())) {
            return ResponseEntity.badRequest().body(
                    "Password must be 8-20 characters long and include " +
                            "at least one uppercase letter, one lowercase letter, " +
                            "one digit, and one special character (@#$%^&+=!)."
            );
        }
        if(adminService.checkIfUserExist(workerRegisterRequestDto.email())){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User with the provided E-mail ID already exists try to login using using credentials or use the option of forgot password");
        }

        adminService.addNewWorker(workerRegisterRequestDto);
        return ResponseEntity.status(HttpStatus.OK).body(workerRegisterRequestDto.email());
    }

    @GetMapping("/issues/all")
    public ResponseEntity<List<IssueDashboardResponseDto>> getAll(){
        return new ResponseEntity<>(adminService.getAllIssues(), HttpStatus.FOUND);
    }

    @GetMapping("/workers")
    public ResponseEntity<List<WorkerResponseDto>> getAllWorkersByDept(){
        return new ResponseEntity<>(adminService.getAllWorkersByDept(), HttpStatus.FOUND);
    }

    @PatchMapping("/issue/assign/{issue_id}")
    public ResponseEntity<?> assignIssueToWorker(@Valid @RequestBody AdminUpdateIssueRequestDto adminUpdateIssueRequestDto, @PathVariable String issue_id){
        return new ResponseEntity<>(adminService.updateIssue(issue_id, adminUpdateIssueRequestDto), HttpStatus.OK);
    }



}
