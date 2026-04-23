/*package com.example.authentify.config;

//import org.hibernate.boot.internal.Abstract;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
//import org.springframework.security.access.method.P;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.authentication.configurers.userdetails.DaoAuthenticationConfigurer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.List;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(
                                "/register",
                                "/login",
                                "/send-reset-otp",
                                "/reset-password",
                                "/logout",
                                "/users/**"
                        ).permitAll()

                        .anyRequest().permitAll()
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

   /* public AuthenticationManager authenticationManager()  {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        return authProvider;
    }*/
    /*@Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    public void adminconfigure(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/admin/**").hasAuthority("ADMIN")
    .anyRequest().authenticated()
);
}
}*/



package com.example.authentify.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
//import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            //.cors(Customizer.withDefaults())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                //Public routes — no token needed
                .requestMatchers(
                    "/api/v1.0/login",
                    "/api/v1.0/register",
                    "/api/v1.0/verify-otp",
                    "/api/v1.0/reset-password",
                    "/api/v1.0/check-email",
                    "/api/v1.0/register-from-demande/**",
                    "/api/v1.0/test",
                    "/api/v1.0/uploads/**",
                    "/api/v1.0/files/**",     
                    "/api/v1.0/demandes/**",
                    "/api/v1.0/email/**",
                    "/api/v1.0/evaluation/**"
                    
                ).permitAll()

                //Public demande registration
                .requestMatchers("/api/v1.0/demandes/**").permitAll()

                //ADMIN or EVALUATEUR only
                .requestMatchers("/api/v1.0/users").hasAnyAuthority("ADMIN","EVALUATEUR")
                //ADMIN only
                .requestMatchers(HttpMethod.DELETE, "/api/v1.0/users/**").hasAuthority("ADMIN")
                .requestMatchers("/api/v1.0/users/*/activer").hasAuthority("ADMIN")
                .requestMatchers("/api/v1.0/users/*/desactiver").hasAuthority("ADMIN")
                .requestMatchers("/api/v1.0/principes/update/**").hasAuthority("ADMIN")
                .requestMatchers("/api/v1.0/*/listOrganismesEval/").hasAuthority("EVALUATEUR")

                //Everything else requires login
                .anyRequest().authenticated()
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            //Add JWT filter before Spring's auth filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    //@Bean
    //public CorsFilter corsFilter() {
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173","https://fragrant-collapse-cuddly.ngrok-free.dev","https://projet-pfe-three.vercel.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        //config.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); //required for cookies
        config.setExposedHeaders(List.of("Set-Cookie", "X-Auth-Token")); //for ngrok
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        //return new CorsFilter(source);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

