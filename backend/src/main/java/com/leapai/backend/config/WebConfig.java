package com.leapai.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;

    // Injected via @Value so the placeholder is resolved (allowedOriginPatterns
    // does not interpolate ${...} itself).
    @Value("${LEAP_APP_ORIGIN:https://career-leap-ai.vercel.app}")
    private String appOrigin;

    public WebConfig(AuthInterceptor authInterceptor, RateLimitInterceptor rateLimitInterceptor) {
        this.authInterceptor = authInterceptor;
        this.rateLimitInterceptor = rateLimitInterceptor;
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
        // Rate limiting runs first so unauthenticated hammering is caught too.
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/health");

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
                        "/api/payments/me",
                        "/api/billing/**",
                        "/api/practice/**",
                        "/api/skills/**",
                        "/api/resume/**",
                        "/api/flashcards/**",
                        "/api/creator/**")
                .excludePathPatterns("/api/health", "/api/payments/status");
    }
}
