package com.civicpulse.civicpulse.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class ImageResourceConfig implements WebMvcConfigurer {

    private final String imageDirectory;

    public ImageResourceConfig(@Value("${app.images.directory:D:/Images}") String imageDirectory) {
        this.imageDirectory = imageDirectory;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resourceLocation = Path.of(imageDirectory).toAbsolutePath().normalize().toUri().toString();
        if (!resourceLocation.endsWith("/")) {
            resourceLocation += "/";
        }

        registry.addResourceHandler("/images/**")
                .addResourceLocations(resourceLocation);
    }
}
