package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.model.Role;
import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.cache.TemporaryUser;
import com.civicpulse.civicpulse.model.dto.CitizenRegisterRequestDto;
import com.civicpulse.civicpulse.repository.redis.TemporaryUserRepo;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private TemporaryUserRepo tempUserRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public void addNewUser(CitizenRegisterRequestDto citizenRegisterRequestDto){
        SecureRandom random = new SecureRandom();
        String otp = String.valueOf(100000 + random.nextInt(900000));
        TemporaryUser tempUser = new TemporaryUser(citizenRegisterRequestDto.email(), citizenRegisterRequestDto.name(), citizenRegisterRequestDto.phoneNumber(), citizenRegisterRequestDto.address(),bCryptPasswordEncoder.encode(citizenRegisterRequestDto.password()),otp);
        tempUserRepo.save(tempUser);
        emailService.sendOtpMail(tempUser.getEmail(), tempUser.getOtp());
    }

    public String verifyAndRegisterUser(String email, String otp) {
        Optional<TemporaryUser> cachedUser = tempUserRepo.findById(email);
        if(cachedUser.isEmpty()){
            return "SESSION_EXPIRED";
        }
        TemporaryUser temporaryUser = cachedUser.get();
        if(!temporaryUser.getOtp().equals(otp)){
            return"INVALID_OTP";
        }
        User finalizedUser = new User();
        finalizedUser.setName(temporaryUser.getName());
        finalizedUser.setEmail(temporaryUser.getEmail());
        finalizedUser.setPhoneNumber(temporaryUser.getPhoneNumber());
        finalizedUser.setAddress(temporaryUser.getAddress());
        finalizedUser.setPassword(temporaryUser.getBCryptedPassword());
        finalizedUser.setRole(Role.CITIZEN);
        finalizedUser.setEnabled(true);
        userRepo.save(finalizedUser);
        //Clean up the Redis cache immediately so the RAM is freed up right away
        tempUserRepo.deleteById(email);
        return "SUCCESS";
    }

    public boolean checkIfUserExist(String email) {
        User user = userRepo.findUserByEmail(email);
        return user!=null;
    }

    public Role whatRole(String email) {
        User user = userRepo.findUserByEmail(email);
        return user.getRole();
    }
}
