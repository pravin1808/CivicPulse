package com.civicpulse.civicpulse.config;

import com.civicpulse.civicpulse.model.User;
import com.civicpulse.civicpulse.model.UserDetailsImpl;
import com.civicpulse.civicpulse.repository.jpa.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserRepo userRepo;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for REST APIs (temporary for development ease)
                .csrf(csrf -> csrf.disable())

                // Define URL Authorization Rules
                .authorizeHttpRequests(auth -> auth
                        // Publicly accessible routes (Registration & Verification)
                        .requestMatchers("/api/sign_up", "/api/verify_otp").permitAll()

                        // Role-Based Access Control (RBAC)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/citizen/**").hasRole("CITIZEN")
                        .requestMatchers("/api/worker/**").hasRole("WORKER")

                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                )

                // Enable standard Form Login or HTTP Basic for baseline testing
                .formLogin(form -> form.defaultSuccessUrl("/", true))
                .httpBasic(basic -> {
                });

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            // Your repository call logic goes here
            User user = userRepo.findByName(username);
            if(user == null){
                throw new UsernameNotFoundException("User 404");
            }
            return new UserDetailsImpl(user);
        };
    }


    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService());
        provider.setPasswordEncoder(bCryptPasswordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration){
        return configuration.getAuthenticationManager();
    }
}