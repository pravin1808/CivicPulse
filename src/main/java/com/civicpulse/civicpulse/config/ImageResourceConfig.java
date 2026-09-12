package com.civicpulse.civicpulse.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ImageResourceConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(ImageResourceConfig.class);

    @Value("${app.images.directory:./uploads/images}")
    private String uploadDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path storagePath;
        try {
            storagePath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        } catch (Exception e) {
            log.warn("Configured upload directory '{}' is invalid. Falling back to default './uploads/images'. Error: {}",
                    uploadDirectory, e.getMessage());
            storagePath = Paths.get("uploads", "images").toAbsolutePath().normalize();
        }

        // Ensure the directory exists on disk so Spring can serve files from it
        File directory = storagePath.toFile();
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (created) {
                log.info("Created local image storage directory at: {}", storagePath);
            }
        }

        String locationUri = storagePath.toUri().toString();
        if (!locationUri.endsWith("/")) {
            locationUri += "/";
        }

        log.info("Serving local images from: {}", locationUri);
        registry.addResourceHandler("/images/**")
                .addResourceLocations(locationUri);
    }
}
