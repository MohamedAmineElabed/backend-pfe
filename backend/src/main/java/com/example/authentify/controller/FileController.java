package com.example.authentify.controller;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;


import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;

@RequestMapping("/api/v1.0")
@RestController
public class FileController {

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> openFile(@PathVariable String filename) throws IOException {
        File file = new File("uploads/" + filename); // make sure "uploads/" is the correct folder
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        // Detect content type
        String contentType = Files.probeContentType(file.toPath());
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(file.length())
                .body(resource);
    }
}
