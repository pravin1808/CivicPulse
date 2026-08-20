package com.civicpulse.civicpulse.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Category> categories;

    public Department(String deptName) {
        this.name = deptName;
    }

    protected Department() { }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public List<Category> getCategories() { return categories; } public void setCategories(List<Category> categories) { this.categories = categories; }
}
