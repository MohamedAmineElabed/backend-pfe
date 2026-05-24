package com.example.authentify.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {

}
/*With @Async:
            The method runs in a separate thread.
            Your API can respond immediately while the task runs in background.*/
