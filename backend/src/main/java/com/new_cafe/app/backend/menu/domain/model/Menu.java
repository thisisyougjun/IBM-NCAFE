package com.new_cafe.app.backend.menu.domain.model;

import java.time.LocalDateTime;
import java.util.List;

import com.new_cafe.app.backend.category.domain.model.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메뉴 도메인 모델 (순수 Java - 프레임워크 의존성 없음)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Menu {
    private Long id;
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 연관 도메인 (필요 시 로딩)
    private Category category;

    private List<MenuImage> images;
}
