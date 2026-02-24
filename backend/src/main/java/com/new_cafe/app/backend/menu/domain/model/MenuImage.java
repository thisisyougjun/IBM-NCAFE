package com.new_cafe.app.backend.menu.domain.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메뉴 이미지 도메인 모델 (순수 Java - 프레임워크 의존성 없음)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuImage {
    private Long id;
    private Long menuId;
    private String srcUrl;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
