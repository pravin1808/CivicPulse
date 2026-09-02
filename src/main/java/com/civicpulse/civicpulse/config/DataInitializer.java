package com.civicpulse.civicpulse.config;

import com.civicpulse.civicpulse.model.Department;
import com.civicpulse.civicpulse.model.Category;
import com.civicpulse.civicpulse.model.Role;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.repository.jpa.DepartmentRepo;
import com.civicpulse.civicpulse.repository.jpa.CategoryRepo;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    @Value("${default.password}")
    private String initialPassword;

    private final DepartmentRepo departmentRepo;
    private final CategoryRepo categoryRepo;
    private final UserRepo userRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(
            DepartmentRepo departmentRepo,
            CategoryRepo categoryRepo,
            UserRepo userRepo,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.departmentRepo = departmentRepo;
        this.categoryRepo = categoryRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
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

        seedInitialUsers();
    }

    private void seedInitialUsers() {
        seedUser(
                "Municipal Administrator",
                "admin@gmail.com",
                "9876543210",
                "CivicPulse Municipal Office, Main Road",
                Role.ADMIN,
                null
        );

        List<WorkerSeed> workers = List.of(
                new WorkerSeed("Aarav Sharma", "aarav@gmail.com", "9876543211", "Public Works & Infrastructure"),
                new WorkerSeed("Priya Patel", "priya@gmail.com", "9876543212", "Sanitation & Waste Management"),
                new WorkerSeed("Rohan Deshmukh", "rohan@gmail.com", "9876543213", "Traffic, Transit & Transportation"),
                new WorkerSeed("Kavya Iyer", "kavya@gmail.com", "9876543214", "Utilities & Energy"),
                new WorkerSeed("Vikram Singh", "vikram@gmail.com", "9876543215", "Health, Safety & Environmental Protection"),
                new WorkerSeed("Neha Kulkarni", "neha@gmail.com", "9876543216", "Public Spaces, Parks & Recreation")
        );

        workers.forEach(worker -> departmentRepo.findByName(worker.departmentName())
                .ifPresent(department -> seedUser(
                        worker.name(),
                        worker.email(),
                        worker.phoneNumber(),
                        "CivicPulse Field Office, " + department.getName(),
                        Role.WORKER,
                        department.getId()
                )));
    }

    private void seedUser(
            String name,
            String email,
            String phoneNumber,
            String address,
            Role role,
            Long departmentId
    ) {
        if (userRepo.findUserByEmail(email) != null) {
            return;
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);
        user.setAddress(address);
        user.setPassword(passwordEncoder.encode(initialPassword));
        user.setRole(role);
        user.setDepartmentId(departmentId);
        user.setEnabled(true);
        userRepo.save(user);
    }

    private record WorkerSeed(String name, String email, String phoneNumber, String departmentName) { }
}
