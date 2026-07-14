package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.model.Issue;
import com.civicpulse.civicpulse.model.Role;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.AdminUpdateIssueRequestDto;
import com.civicpulse.civicpulse.model.dto.IssueDashboardResponseDto;
import com.civicpulse.civicpulse.model.dto.WorkerRegisterRequestDto;
import com.civicpulse.civicpulse.model.dto.WorkerResponseDto;
import com.civicpulse.civicpulse.repository.jpa.IssueRepo;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private IssueRepo issueRepo;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public boolean checkIfUserExist(String email) {
        User user = userRepo.findUserByEmail(email);
        return user!=null;
    }

    public void addNewWorker(WorkerRegisterRequestDto workerRegisterRequestDto){
        User worker = new User();
        worker.setName(workerRegisterRequestDto.name());
        worker.setPhoneNumber(workerRegisterRequestDto.phoneNumber());
        worker.setEmail(workerRegisterRequestDto.email());
        worker.setAddress(workerRegisterRequestDto.address());
        worker.setPassword(bCryptPasswordEncoder.encode(workerRegisterRequestDto.password()));
        worker.setRole(Role.WORKER);
        worker.setDepartmentId(workerRegisterRequestDto.dept_id());
        worker.setEnabled(true);
        userRepo.save(worker);
    }

    public List<IssueDashboardResponseDto> getAllIssues() {
        List<Issue> allIssues = issueRepo.findAll();
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

    public List<WorkerResponseDto> getAllWorkersByDept() {
        List<User> allWorkers = userRepo.findByRoleOrderByDepartmentIdAsc(Role.WORKER);

        List<WorkerResponseDto> workerResponseDtos = new ArrayList<>();

        for(User worker : allWorkers){
            WorkerResponseDto workerResponse = new WorkerResponseDto(
                    worker.getId(),
                    worker.getName(),
                    worker.getEmail(),
                    worker.getPhoneNumber(),
                    worker.getAddress(),
                    worker.getDepartmentId()
            );

            workerResponseDtos.add(workerResponse);

        }

        return workerResponseDtos;
    }

    @Transactional
    public IssueDashboardResponseDto updateIssue(String issueId, AdminUpdateIssueRequestDto request) {
        Issue issue = Optional.ofNullable(issueRepo.findByIssueId(issueId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (request.workerId() != null) {
            User worker = userRepo.findById(request.workerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

            if (worker.getRole() != Role.WORKER) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a worker");
            }

            if (!worker.getDepartmentId().equals(issue.getCategory().getDepartment().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Worker belongs to another department");
            }

            issue.setWorker(worker);
        }

        if (request.status() != null) {
            issue.setStatus(request.status());
        }

        Issue updatedIssue = issueRepo.save(issue);

        return new IssueDashboardResponseDto(
                updatedIssue.getIssueId(),
                updatedIssue.getTitle(),
                updatedIssue.getDescription(),
                updatedIssue.getStatus(),
                updatedIssue.getLatitude(),
                updatedIssue.getLongitude(),
                updatedIssue.getCreatedAt(),
                updatedIssue.getUpdatedAt(),
                updatedIssue.getCategory().getDepartment().getId(),
                updatedIssue.getCategory().getId(),
                updatedIssue.getCitizen()
        );
    }
}
