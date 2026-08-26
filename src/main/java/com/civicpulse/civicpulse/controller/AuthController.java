package com.civicpulse.civicpulse.controller;

import com.civicpulse.civicpulse.exception.AccessForbiddenException;
import com.civicpulse.civicpulse.exception.DuplicateResourceException;
import com.civicpulse.civicpulse.model.Role;
import com.civicpulse.civicpulse.model.dto.*;
import com.civicpulse.civicpulse.service.JwtService;
import com.civicpulse.civicpulse.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth/")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;

    @PostMapping("citizen/register")
    public ResponseEntity<?> registerNewCitizen(@Valid @RequestBody CitizenRegisterRequestDto citizenRegisterRequestDto) {
        if (!PasswordValidator.isValid(citizenRegisterRequestDto.password())) {
            return ResponseEntity.badRequest().body(
                    "Password must be 8-20 characters long and include " +
                            "at least one uppercase letter, one lowercase letter, " +
                            "one digit, and one special character (@#$%^&+=!)."
            );
        }
        if (authService.checkIfUserExist(citizenRegisterRequestDto.email())) {
            throw new DuplicateResourceException("A user with email '" + citizenRegisterRequestDto.email() + "' already exists.");
        }
        authService.addNewUser(citizenRegisterRequestDto);
        return ResponseEntity.status(HttpStatus.OK).body(citizenRegisterRequestDto.email());
    }

    @PostMapping("citizen/verify_otp")
    public ResponseEntity<?> verifyCitizenOtpAndRegister(@Valid @RequestBody OtpRequestDto otpRequestDto) {
        String result = authService.verifyAndRegisterUser(otpRequestDto.email(), otpRequestDto.otp());

        return switch (result) {
            case "SUCCESS" -> ResponseEntity.ok("Account successfully verified and activated!");
            case "INVALID_OTP" -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("The OTP entered is incorrect. Please check your email and try again.");
            case "SESSION_EXPIRED" -> ResponseEntity.status(HttpStatus.GONE)
                    .body("Verification session expired (2-minute limit reached). Please sign up again.");
            default -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected authentication error occurred.");
        };
    }

    @PostMapping("citizen/login")
    public ResponseEntity<?> citizenLogin(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequestDto.email(), loginRequestDto.password())
            );
            if (authentication.isAuthenticated()) {
                Role role = authService.whatRole(loginRequestDto.email());
                if (role != Role.CITIZEN) {
                    throw new AccessForbiddenException("This login endpoint is for citizens only.");
                }
                String token = jwtService.generateToken(loginRequestDto.email(), "ROLE_" + role.name());
                return ResponseEntity.ok(new AuthResponseDto(token));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed.");
        } catch (AccessForbiddenException e) {
            throw e;
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
    }

    @PostMapping("admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequestDto.email(), loginRequestDto.password())
            );
            if (authentication.isAuthenticated()) {
                Role role = authService.whatRole(loginRequestDto.email());
                if (role != Role.ADMIN) {
                    throw new AccessForbiddenException("This login endpoint is for admins only.");
                }
                String token = jwtService.generateToken(loginRequestDto.email(), "ROLE_" + role.name());
                return ResponseEntity.ok(new AuthResponseDto(token));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed.");
        } catch (AccessForbiddenException e) {
            throw e;
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
    }

    @PostMapping("worker/login")
    public ResponseEntity<?> workerLogin(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequestDto.email(), loginRequestDto.password())
            );
            if (authentication.isAuthenticated()) {
                Role role = authService.whatRole(loginRequestDto.email());
                if (role != Role.WORKER) {
                    throw new AccessForbiddenException("This login endpoint is for workers only.");
                }
                String token = jwtService.generateToken(loginRequestDto.email(), "ROLE_" + role.name());
                return ResponseEntity.ok(new AuthResponseDto(token));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed.");
        } catch (AccessForbiddenException e) {
            throw e;
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
    }

    @PostMapping("/forgot_password")
    public ResponseEntity<?> forgotPasswordGenerateOtp(@Valid @RequestBody EmailDto emailDto) {
        if (authService.checkIfUserExist(emailDto.email())) {
            authService.forgotPasswordOtpRequest(emailDto.email());
            return new ResponseEntity<>(emailDto, HttpStatus.ACCEPTED);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @PostMapping("verify_otp/login")
    public ResponseEntity<?> verifyOtpAndLogin(@Valid @RequestBody OtpRequestDto otpRequestDto) {
        String token = authService.verifyOtpAndLogin(otpRequestDto);
        return ResponseEntity.ok(new AuthResponseDto(token));
    }


    static class PasswordValidator {
        private static final String PASSWORD_PATTERN =
                "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,20}$";

        private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);
        public static boolean isValid(String password) {
            if (password == null) return false;
            return pattern.matcher(password).matches();
        }
    }

}
