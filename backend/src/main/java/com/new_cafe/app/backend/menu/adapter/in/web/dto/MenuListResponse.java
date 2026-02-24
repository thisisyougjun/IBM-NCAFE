package com.new_cafe.app.backend.menu.adapter.in.web.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 목록 응답 DTO (Web Adapter 계층)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuListResponse {
    private List<MenuItemResponse> menus;
    private int total;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItemResponse {
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
}
