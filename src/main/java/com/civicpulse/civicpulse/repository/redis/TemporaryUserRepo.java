package com.civicpulse.civicpulse.repository.redis;

import com.civicpulse.civicpulse.model.cache.TemporaryUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemporaryUserRepo extends JpaRepository<TemporaryUser, String> {

}
