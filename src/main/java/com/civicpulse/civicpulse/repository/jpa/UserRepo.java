package com.civicpulse.civicpulse.repository.jpa;

import com.civicpulse.civicpulse.model.Role;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.dto.WorkerResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    User findUserByNameAndPassword(String name, String encode);

    User findUserByEmail(String email);

    List<User> findByRoleOrderByDepartmentIdAsc(Role role);
}