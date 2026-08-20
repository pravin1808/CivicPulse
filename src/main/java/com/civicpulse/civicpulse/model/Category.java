package com.civicpulse.civicpulse.model;


import jakarta.persistence.*;
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    public Category(String catName, Department dept) {
        this.name = catName;
        this.department = dept;
    }

    protected Category() { }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public Department getDepartment() { return department; } public void setDepartment(Department department) { this.department = department; }

}
