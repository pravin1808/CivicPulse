package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.exception.AccessForbiddenException;
import com.civicpulse.civicpulse.exception.DuplicateResourceException;
import com.civicpulse.civicpulse.exception.ResourceNotFoundException;
import com.civicpulse.civicpulse.model.Issue;
import com.civicpulse.civicpulse.model.Role;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.*;
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
        return userRepo.findUserByEmail(email) != null;
    }

    public void addNewWorker(WorkerRegisterRequestDto workerRegisterRequestDto) {
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

    public List<WorkerResponseDto> getAllWorkersByDept() {
        List<User> allWorkers = userRepo.findByRoleOrderByDepartmentIdAsc(Role.WORKER);
        List<WorkerResponseDto> workerResponseDtos = new ArrayList<>();
        for (User worker : allWorkers) {
            workerResponseDtos.add(new WorkerResponseDto(
                    worker.getId(),
                    worker.getName(),
                    worker.getEmail(),
                    worker.getPhoneNumber(),
                    worker.getAddress(),
                    worker.getDepartmentId()
            ));
        }
        return workerResponseDtos;
    }

    @Transactional
    public IssueDashboardResponseDto updateIssue(String issueId, AdminUpdateIssueRequestDto request) {
        Issue issue = Optional.ofNullable(issueRepo.findByIssueId(issueId))
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with ID: " + issueId));

        if (request.workerId() != null) {
            User worker = userRepo.findById(request.workerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + request.workerId()));

            if (worker.getRole() != Role.WORKER) {
                throw new AccessForbiddenException("The selected user is not a worker.");
            }

            if (!worker.getDepartmentId().equals(issue.getCategory().getDepartment().getId())) {
                throw new AccessForbiddenException("Worker belongs to a different department than the issue's category.");
            }

            issue.setWorker(worker);
        }

        if (request.status() != issue.getStatus()) {
            issue.setStatus(request.status());
        }

        issue.setUpdatedAt(LocalDateTime.now());
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
                new IssuesCitizenDto(
                        updatedIssue.getCitizen().getId(),
                        updatedIssue.getCitizen().getName(),
                        updatedIssue.getCitizen().getEmail(),
                        updatedIssue.getCitizen().getPhoneNumber()
                )
        );
    }

    public WorkerResponseDto getWorkerById(Long workerId) {
        User worker = userRepo.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + workerId));

        return new WorkerResponseDto(
                worker.getId(),
                worker.getName(),
                worker.getEmail(),
                worker.getPhoneNumber(),
                worker.getAddress(),
                worker.getDepartmentId()
        );
    }

    public WorkerResponseDto updateWorkerById(WorkerRequestDto workerRequestDto, Long workerId) {
        User worker = userRepo.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + workerId));

        worker.setName(workerRequestDto.name());
        worker.setPhoneNumber(workerRequestDto.phoneNumber());
        worker.setAddress(workerRequestDto.address());
        worker.setDepartmentId(workerRequestDto.dept_id());

        User updated = userRepo.save(worker);

        return new WorkerResponseDto(
                updated.getId(),
                updated.getName(),
                updated.getEmail(),
                updated.getPhoneNumber(),
                updated.getAddress(),
                updated.getDepartmentId()
        );
    }

    public void deleteWorkerById(Long workerId) {
        User worker = userRepo.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with ID: " + workerId));
        userRepo.delete(worker);
    }

    public SingleIssueResponseDto getIssueById(String issueId) {
        Issue issue = Optional.ofNullable(issueRepo.findByIssueId(issueId))
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with ID: " + issueId));

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
}
