package com.example.authentify.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1.0/uploads")
public class UploadController {

    private final Path uploadPath = Paths.get("uploads").toAbsolutePath();

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) throws MalformedURLException {

        Path file = uploadPath.resolve(filename).normalize();
        Resource resource = new UrlResource(file.toUri());

        if (!resource.exists()) {
            System.out.println("File not found: " + file);
            return ResponseEntity.notFound().build();
        }

        System.out.println("File found: " + file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}