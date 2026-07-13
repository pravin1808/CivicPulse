package com.civicpulse.civicpulse.repository.jpa;

import com.civicpulse.civicpulse.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface IssueRepo extends JpaRepository<Issue, Long> {

    // For Citizen Dashboard: See their own submitted issues
    List<Issue> findByCitizenId(Long citizenId);

    // For Worker Dashboard: See unassigned issues OR issues assigned specifically to them within their department
    @Query("SELECT i FROM Issue i WHERE i.category.department.id = :deptId AND (i.worker.id = :workerId OR i.status = 'PENDING')")
    List<Issue> findAvailableIssuesForWorker(@Param("deptId") Long deptId, @Param("workerId") Long workerId);

    Issue findByIssueId(String issueId);

}