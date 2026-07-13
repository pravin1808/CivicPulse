package com.civicpulse.civicpulse.repository.jpa;

import com.civicpulse.civicpulse.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepo extends JpaRepository<Category, Long> {
    
}
