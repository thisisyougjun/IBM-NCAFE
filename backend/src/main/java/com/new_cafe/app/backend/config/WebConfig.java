package com.new_cafe.app.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 환경변수 ALLOWED_ORIGINS 로 여러 주소를 콤마로 지정 가능
    // 예) ALLOWED_ORIGINS=http://localhost:3000,http://서버IP:3065
    // 미설정 시 기본값으로 로컬/배포 공용 주소 모두 허용
    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:3001,http://localhost:3065}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")   // BFF 서버→서버 통신이므로 전체 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true);
    }
}
