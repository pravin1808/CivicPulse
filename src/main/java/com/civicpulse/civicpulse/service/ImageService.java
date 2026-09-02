package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.exception.ImageStorageException;
import com.civicpulse.civicpulse.exception.InvalidImageException;
import com.civicpulse.civicpulse.model.Category;
import com.civicpulse.civicpulse.repository.jpa.CategoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

@Service
public class ImageService {

    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    @Autowired
    private CategoryRepo categoryRepo;

    @Value("${app.images.directory:D:/Images}")
    private String uploadDirectory;

    public String saveImage(Long categoryId, String issueId, MultipartFile imageFile, String afterOrBefore) {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new InvalidImageException("Choose a non-empty image file.");
        }

        Category category = categoryRepo.findById(categoryId).orElseThrow(() -> new RuntimeException("Category Not Found"));
        String originalFilename = imageFile.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new InvalidImageException("The selected image must have a file name.");
        }

        int extensionStart = originalFilename.lastIndexOf('.');
        if (extensionStart <= 0 || extensionStart == originalFilename.length() - 1) {
            throw new InvalidImageException("Upload an image with a valid file extension, such as .jpg or .png.");
        }

        String fileExtension = originalFilename.substring(extensionStart);
        String uniqueFileName = issueId + "," + afterOrBefore + fileExtension;
        Path rootDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        Path categoryDirectory = rootDirectory
                .resolve(category.getDepartment().getName())
                .resolve(category.getName())
                .normalize();

        if (!categoryDirectory.startsWith(rootDirectory)) {
            throw new InvalidImageException("The image destination is invalid.");
        }

        Path imagePath = categoryDirectory.resolve(uniqueFileName).normalize();
        if (!imagePath.startsWith(categoryDirectory)) {
            throw new InvalidImageException("The image file name is invalid.");
        }

        try {
            Files.createDirectories(categoryDirectory);
            Files.write(imagePath, imageFile.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return imagePath.toString();
        } catch (Exception exception) {
            log.error("Unable to save {} image for issue {} at {}", afterOrBefore, issueId, imagePath, exception);
            throw new ImageStorageException("The resolution image could not be saved. Please choose another image and try again.", exception);
        }
    }

}
