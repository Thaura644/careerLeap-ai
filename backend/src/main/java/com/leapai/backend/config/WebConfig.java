package com.leapai.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    // Injected via @Value so the placeholder is resolved (allowedOriginPatterns
    // does not interpolate ${...} itself).
    @Value("${LEAP_APP_ORIGIN:https://career-leap-ai.vercel.app}")
    private String appOrigin;

    public WebConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // Vite dev server + production frontend origin (overridable via env).
                .allowedOriginPatterns("http://localhost:*", appOrigin)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns(
                        "/api/auth/me",
                        "/api/auth/profile",
                        "/api/dashboard/**",
                        "/api/resources/**",
                        "/api/community/**",
                        "/api/insights/**",
                        "/api/ai/**",
                        "/api/goals/**",
                        "/api/payments/verify",
                        "/api/payments/me")
                .excludePathPatterns("/api/health", "/api/payments/status");
    }
}
