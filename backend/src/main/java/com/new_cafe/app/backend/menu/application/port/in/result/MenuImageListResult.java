package com.new_cafe.app.backend.menu.application.port.in.result;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메뉴 이미지 목록 조회 결과
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuImageListResult {
    private Long menuId;
    private String menuName;
    private List<MenuImageItemResult> images;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuImageItemResult {
        private Long id;
        private String url;
        private String altText;
        private Boolean isPrimary;
        private Integer sortOrder;
    }
}
