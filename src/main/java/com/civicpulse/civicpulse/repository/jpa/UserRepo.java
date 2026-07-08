package com.civicpulse.civicpulse.repository.jpa;

import com.civicpulse.civicpulse.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    User findByName(String username);

}
