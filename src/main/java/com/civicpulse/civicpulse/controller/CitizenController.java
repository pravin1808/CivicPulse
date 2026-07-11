package com.civicpulse.civicpulse.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/citizen")
public class CitizenController {

    @GetMapping("/hello")
    public String hello(){
        return "Hello World";
    }
}
