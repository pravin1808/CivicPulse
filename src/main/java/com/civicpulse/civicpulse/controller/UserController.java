package com.civicpulse.civicpulse.controller;

import com.civicpulse.civicpulse.model.dto.OtpRequestDto;
import com.civicpulse.civicpulse.model.dto.UserRequestDto;
import com.civicpulse.civicpulse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/sign_up")
    public boolean addUser(@RequestBody UserRequestDto userRequestDto){
        return userService.addNewUser(userRequestDto);
    }

    @PostMapping("/verify_otp")
    public ResponseEntity<?> verifyUser(@RequestBody OtpRequestDto otpRequestDto){
        String result = userService.verifyAndRegisterUser(otpRequestDto.email(), otpRequestDto.otp());

        return switch (result) {
            case "SUCCESS" -> ResponseEntity.ok("Account successfully verified and activated!");
            case "INVALID_OTP" -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("The OTP entered is incorrect. Please check Mailtrap and try again.");
            case "SESSION_EXPIRED" -> ResponseEntity.status(HttpStatus.GONE)
                    .body("Verification session expired (2-minute limit reached). Please sign up again.");
            default -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected authentication error occurred.");
        };
    }

}
