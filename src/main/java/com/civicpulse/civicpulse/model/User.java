package com.civicpulse.civicpulse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity(name="users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq_gen")
    @SequenceGenerator(
            name = "user_seq_gen",
            sequenceName = "users_new_id_seq",
            initialValue = 100,
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    // Password-reset OTPs are BCrypt hashes (about 60 characters), not plain 6-digit values.
    @Column(length = 255)
    private String otp;

    @Column(name = "otp_expiry_time")
    private LocalDateTime otpExpTime;

    @Column(name = "otp_requested_at")
    private LocalDateTime otpRequestedAt;

    @Column(name = "otp_attempt_count", nullable = false, columnDefinition = "integer default 0")
    private int otpAttemptCount = 0;

    @Column(name = "dept_id")
    private Long departmentId;

    private boolean enabled = false;

    public User() { }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; } public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getAddress() { return address; } public void setAddress(String address) { this.address = address; }
    public String getPassword() { return password; } public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; } public void setRole(Role role) { this.role = role; }
    public String getOtp() { return otp; } public void setOtp(String otp) { this.otp = otp; }
    public LocalDateTime getOtpExpTime() { return otpExpTime; } public void setOtpExpTime(LocalDateTime otpExpTime) { this.otpExpTime = otpExpTime; }
    public LocalDateTime getOtpRequestedAt() { return otpRequestedAt; } public void setOtpRequestedAt(LocalDateTime otpRequestedAt) { this.otpRequestedAt = otpRequestedAt; }
    public int getOtpAttemptCount() { return otpAttemptCount; } public void setOtpAttemptCount(int otpAttemptCount) { this.otpAttemptCount = otpAttemptCount; }
    public Long getDepartmentId() { return departmentId; } public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public boolean isEnabled() { return enabled; } public void setEnabled(boolean enabled) { this.enabled = enabled; }

}
