package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.exception.ImageStorageException;
import com.civicpulse.civicpulse.exception.InvalidImageException;
import com.civicpulse.civicpulse.model.Category;
import com.civicpulse.civicpulse.repository.jpa.CategoryRepo;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
import java.util.Map;

@Service
public class ImageService {

    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    @Autowired
    private CategoryRepo categoryRepo;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${app.images.directory:./uploads/images}")
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

        String label = afterOrBefore != null ? afterOrBefore.trim() : "image";

        if (cloudName != null && !cloudName.isBlank() && apiKey != null && !apiKey.isBlank() && apiSecret != null && !apiSecret.isBlank()) {
            try {
                Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                        "cloud_name", cloudName,
                        "api_key", apiKey,
                        "api_secret", apiSecret,
                        "secure", true
                ));

                String folder = "civicpulse/" + toSlug(category.getDepartment().getName()) + "/" + toSlug(category.getName());
                String publicId = toSlug(issueId) + "_" + toSlug(label);

                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.asMap(
                        "folder", folder,
                        "public_id", publicId,
                        "overwrite", true,
                        "resource_type", "auto"
                ));

                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Successfully uploaded image to Cloudinary: {}", secureUrl);
                return secureUrl;
            } catch (Exception exception) {
                log.error("Cloudinary upload failed for issue {} ({}): {}", issueId, label, exception.getMessage(), exception);
                throw new ImageStorageException("The image could not be uploaded to cloud storage. Please try again.", exception);
            }
        }

        String fileExtension = originalFilename.substring(extensionStart);
        String uniqueFileName = issueId + "," + label + fileExtension;
        
        Path rootDirectory;
        try {
            rootDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        } catch (Exception e) {
            log.warn("Invalid upload directory '{}'. Falling back to './uploads/images'.", uploadDirectory);
            rootDirectory = Paths.get("uploads", "images").toAbsolutePath().normalize();
        }

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
            // Return clean web-relative path for local storage instead of raw OS filesystem path
            return "/images/" + category.getDepartment().getName() + "/" + category.getName() + "/" + uniqueFileName;
        } catch (Exception exception) {
            log.error("Unable to save {} image for issue {} at {}", label, issueId, imagePath, exception);
            throw new ImageStorageException("The resolution image could not be saved. Please choose another image and try again.", exception);
        }
    }

    private String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "unspecified";
        }
        return input.trim()
                .replaceAll("[^a-zA-Z0-9_-]+", "_")
                .replaceAll("^_+|_+$", "")
                .toLowerCase();
    }

}
