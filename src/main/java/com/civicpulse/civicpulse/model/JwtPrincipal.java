package com.civicpulse.civicpulse.model;

/**
 * Lightweight principal stored in the SecurityContext for every authenticated request.
 * Extracted from JWT claims by JwtFilter — avoids a DB lookup to resolve identity.
 *
 * @param email        the user's email (JWT subject)
 * @param userId       the user's DB primary key
 * @param departmentId the worker's department ID (null for CITIZEN and ADMIN roles)
 */
public record JwtPrincipal(String email, Long userId, Long departmentId) {}
