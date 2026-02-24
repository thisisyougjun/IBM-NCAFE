package com.new_cafe.app.backend.category.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 카테고리 도메인 모델 (순수 Java - 프레임워크 의존성 없음)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    private Integer id;
    private String name;
}
