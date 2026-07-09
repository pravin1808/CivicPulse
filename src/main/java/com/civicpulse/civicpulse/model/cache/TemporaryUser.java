package com.civicpulse.civicpulse.model.cache;

import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@RedisHash(value = "TemporaryUser", timeToLive = 300L)
public class TemporaryUser implements Serializable {

    @Id
    private String email;
    private String name;
    private String phoneNumber;
    private String address;
    private String bCryptedPassword;
    private String otp;

}
