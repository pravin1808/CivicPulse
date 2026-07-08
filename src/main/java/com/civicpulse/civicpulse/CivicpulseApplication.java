package com.civicpulse.civicpulse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@EnableJpaRepositories(basePackages = "com.civicpulse.civicpulse.repository.jpa")
@EnableRedisRepositories(basePackages = "com.civicpulse.civicpulse.repository.redis")
@SpringBootApplication
public class CivicpulseApplication {

	public static void main(String[] args) {
		SpringApplication.run(CivicpulseApplication.class, args);
	}

}
