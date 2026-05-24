package com.example.authentify.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Map /uploads/** to the local folder /uploads/
        registry.addResourceHandler("/api/v1.0/uploads/**")
                //.addResourceLocations("file:C:/Users/moham/Desktop/developpement_pfe/backend/uploads/"); // 'uploads' folder in project root
                .addResourceLocations("file:../uploads/");
        System.out.println(new java.io.File("../../uploads").getAbsolutePath());
    }
}