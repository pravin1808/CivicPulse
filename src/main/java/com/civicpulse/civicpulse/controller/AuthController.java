package com.civicpulse.civicpulse.controller;

import com.civicpulse.civicpulse.model.Role;
import com.civicpulse.civicpulse.model.dto.AuthResponseDto;
import com.civicpulse.civicpulse.model.dto.CitizenRequestDto;
import com.civicpulse.civicpulse.model.dto.LoginRequestDto;
import com.civicpulse.civicpulse.model.dto.OtpRequestDto;
import com.civicpulse.civicpulse.service.JwtService;
import com.civicpulse.civicpulse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth/")
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @PostMapping("citizen/register")
    public ResponseEntity<?> registerNewCitizen(@RequestBody CitizenRequestDto citizenRequestDto){
        if(!PasswordValidator.isValid(citizenRequestDto.password())){
            return ResponseEntity.badRequest().body(
                    "Password must be 8-20 characters long and include " +
                            "at least one uppercase letter, one lowercase letter, " +
                            "one digit, and one special character (@#$%^&+=!)."
            );
        }
        if(userService.checkIfUserExist(citizenRequestDto.email())){
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body("User with the provided E-mail ID already exists try to login using using credentials or use the option of forgot password");
        }
        userService.addNewUser(citizenRequestDto);
        return ResponseEntity.status(HttpStatus.OK).body(citizenRequestDto.email());
    }

    @PostMapping("citizen/verify_otp")
    public ResponseEntity<?> verifyCitizenOtpAndRegister(@RequestBody OtpRequestDto otpRequestDto){
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

    @PostMapping("citizen/login")
    public ResponseEntity<?> citizenLogin(@RequestBody LoginRequestDto loginRequestDto){
        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                    loginRequestDto.email(),
                    loginRequestDto.password()
                    )
            );

            if(authentication.isAuthenticated()){

                Role role = userService.whatRole(loginRequestDto.email());

                if(!(role==Role.CITIZEN)){
                    return ResponseEntity.status(401).body("Your Role is not Citizen");
                }
                String token = jwtService.generateToken(loginRequestDto.email(), "ROLE_" + role.name());
                return ResponseEntity.ok(new AuthResponseDto(token));
            }else{
                return ResponseEntity.status(401).body("Authentication Failed");
            }
        }catch (Exception e){
            return ResponseEntity.status(401).body("Invalid User Name or Password");
        }
    }

    @PostMapping("admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequestDto loginRequestDto){
        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequestDto.email(),
                            loginRequestDto.password()
                    )
            );

            if(authentication.isAuthenticated()){
                Role role = userService.whatRole(loginRequestDto.email());
                if(!(role == Role.ADMIN)){
                    return ResponseEntity.status(401).body("You are not an admin");
                }
                String token = jwtService.generateToken(loginRequestDto.email(), "ROLE_" + role.name());
                return ResponseEntity.ok(new AuthResponseDto(token));
            }else{
                return ResponseEntity.status(401).body("Authentication Failed");
            }
        }catch (Exception e){
            return ResponseEntity.status(401).body("Invalid User Name or Password");
        }
    }


    @PostMapping("worker/login")
    public ResponseEntity<?> workerLogin(@RequestBody LoginRequestDto loginRequestDto){
        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequestDto.email(),
                            loginRequestDto.password()
                    )
            );

            if(authentication.isAuthenticated()){

                Role role  = userService.whatRole(loginRequestDto.email());
                if(!(role == Role.WORKER)){
                    return ResponseEntity.status(401).body("You are not an worker");
                }
                String token = jwtService.generateToken(loginRequestDto.email(), "ROLE_" + role.name());
                return ResponseEntity.ok(new AuthResponseDto(token));
            }else{
                System.out.println(5);
                return ResponseEntity.status(401).body("Authentication Failed");
            }
        }catch (Exception e){
            return ResponseEntity.status(401).body("Invalid User Name or Password");
        }
    }


    private static class PasswordValidator {
        private static final String PASSWORD_PATTERN =
                "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,20}$";

        private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);
        public static boolean isValid(String password) {
            if (password == null) {
                return false;
            }
            return pattern.matcher(password).matches();
        }
    }

}
