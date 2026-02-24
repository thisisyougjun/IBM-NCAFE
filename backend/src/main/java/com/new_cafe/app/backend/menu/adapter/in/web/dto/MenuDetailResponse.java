package com.new_cafe.app.backend.menu.adapter.in.web.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 상세 응답 DTO (Web Adapter 계층)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuDetailResponse {
    private Long id;
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private String categoryName;
    private String imageSrc;
    private Boolean isAvailable;
    private Boolean isSoldOut;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
