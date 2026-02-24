package com.new_cafe.app.backend.category.adapter.out.persistence.mapper;

import org.springframework.stereotype.Component;

import com.new_cafe.app.backend.category.adapter.out.persistence.entity.CategoryJpaEntity;
import com.new_cafe.app.backend.category.domain.model.Category;

/**
 * 카테고리 도메인 모델 ↔ JPA 엔티티 변환 매퍼
 */
@Component
public class CategoryMapper {

    public Category toDomain(CategoryJpaEntity entity) {
        if (entity == null) return null;
        return Category.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }

    public CategoryJpaEntity toJpaEntity(Category domain) {
        if (domain == null) return null;
        return CategoryJpaEntity.builder()
                .id(domain.getId())
                .name(domain.getName())
                .build();
    }
}
