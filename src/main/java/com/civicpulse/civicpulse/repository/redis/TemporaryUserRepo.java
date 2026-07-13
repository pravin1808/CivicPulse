package com.civicpulse.civicpulse.repository.redis;

import com.civicpulse.civicpulse.model.cache.TemporaryUser;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemporaryUserRepo extends CrudRepository<TemporaryUser, String> {

}
