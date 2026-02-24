package com.new_cafe.app.backend.menu.adapter.in.web.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 이미지 목록 응답 DTO (Web Adapter 계층)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuImageListResponse {
    private Long menuId;
    private String menuName;
    private List<MenuImageItemResponse> images;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuImageItemResponse {
        private Long id;
        private String url;
        private String altText;
        private Boolean isPrimary;
        private Integer sortOrder;
    }
}
