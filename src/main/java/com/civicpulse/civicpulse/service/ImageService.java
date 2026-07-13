package com.civicpulse.civicpulse.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageService {

    private final String UPLOAD_DIR = "D:\\Images\\";

    public String saveImage(MultipartFile imageFile) throws Exception {
        if (imageFile.isEmpty()) {
            return null;
        }
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        String originalFilename = imageFile.getOriginalFilename();
        assert originalFilename != null;
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        Path path = Paths.get(UPLOAD_DIR + uniqueFileName);
        Files.write(path, imageFile.getBytes());

        return UPLOAD_DIR+uniqueFileName;
    }

}
