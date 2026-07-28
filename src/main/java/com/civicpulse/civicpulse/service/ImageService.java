package com.civicpulse.civicpulse.service;

import com.civicpulse.civicpulse.model.Category;
import com.civicpulse.civicpulse.repository.jpa.CategoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageService {

    @Autowired
    private CategoryRepo categoryRepo;

    public String saveImage(Long categoryId, String issueId, MultipartFile imageFile, String afterOrBefore) throws Exception {

        String UPLOAD_DIR = "D:\\Images\\";
        if (imageFile.isEmpty()) {
            return null;
        }

        Category category = categoryRepo.findById(categoryId).orElseThrow(() -> new RuntimeException("Category Not Found"));

        UPLOAD_DIR = UPLOAD_DIR+category.getDepartment().getName()+"\\"+category.getName()+"\\";
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        String originalFilename = imageFile.getOriginalFilename();
        assert originalFilename != null;
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFileName = issueId + "," + afterOrBefore + fileExtension;

        Path path = Paths.get(UPLOAD_DIR + uniqueFileName);
        Files.write(path, imageFile.getBytes());

        return UPLOAD_DIR+uniqueFileName;
    }

}
