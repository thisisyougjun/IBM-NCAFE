package com.new_cafe.app.backend.menu.application.port.in.result;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메뉴 목록 조회 결과
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuListResult {
    private List<MenuItemResult> menus;
    private int total;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItemResult {
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
