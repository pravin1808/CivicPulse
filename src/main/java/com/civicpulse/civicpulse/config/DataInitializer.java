package com.civicpulse.civicpulse.config;

import com.civicpulse.civicpulse.model.Department;
import com.civicpulse.civicpulse.model.Category;
import com.civicpulse.civicpulse.repository.jpa.DepartmentRepo;
import com.civicpulse.civicpulse.repository.jpa.CategoryRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepo departmentRepo;
    private final CategoryRepo categoryRepo;

    public DataInitializer(DepartmentRepo departmentRepo, CategoryRepo categoryRepo) {
        this.departmentRepo = departmentRepo;
        this.categoryRepo = categoryRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Prevent duplicate insertions on app restarts
        if (departmentRepo.count() == 0) {

            // Hardcoded Map of Departments -> List of Categories
            Map<String, List<String>> initialData = Map.of(
                    "Public Works & Infrastructure", List.of("Pothole Repairs & Road Damages", "Sidewalks & Walkways", "Drainage & Stormwater"),
                    "Sanitation & Waste Management", List.of("Garbage Accumulation", "Illegal Dumping", "Litter & Public Bins"),
                    "Traffic, Transit & Transportation", List.of("Streetlights", "Traffic Signals", "Signage & Lane Markings"),
                    "Utilities & Energy", List.of("Water Supply", "Electricity & Power Failures", "Sewage Maintenance"),
                    "Health, Safety & Environmental Protection", List.of("Noise Disturbances", "Stray Animal Control", "Air & Water Quality"),
                    "Public Spaces, Parks & Recreation", List.of("Damaged Public Infrastructure", "Tree Trimming & Landscaping", "Graffiti & Vandalism")
            );

            // Loop through the data map and save to PostgreSQL
            initialData.forEach((deptName, categories) -> {
                Department dept = departmentRepo.save(new Department(deptName));
                categories.forEach(catName -> {
                    categoryRepo.save(new Category(catName, dept));
                });
            });

            System.out.println("[DataInitializer] Successfully hardcoded all CivicPulse departments and categories!");
        }
    }
}
