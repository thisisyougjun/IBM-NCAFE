package com.new_cafe.app.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /image/** 요청을 로컬 파일 시스템의 backend/upload 디렉토리로 매핑
        registry.addResourceHandler("/image/**")
                .addResourceLocations("file:./upload/");

        // /images/** 요청도 동일하게 매핑 (DB 데이터 호환성 위해)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:./upload/");
    }
}
