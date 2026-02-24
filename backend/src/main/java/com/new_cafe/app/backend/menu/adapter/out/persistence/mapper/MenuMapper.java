package com.new_cafe.app.backend.menu.adapter.out.persistence.mapper;

import org.springframework.stereotype.Component;

import com.new_cafe.app.backend.category.adapter.out.persistence.mapper.CategoryMapper;
import com.new_cafe.app.backend.category.domain.model.Category;
import com.new_cafe.app.backend.menu.adapter.out.persistence.entity.MenuJpaEntity;
import com.new_cafe.app.backend.menu.domain.model.Menu;

import lombok.RequiredArgsConstructor;

/**
 * 메뉴 도메인 모델 ↔ JPA 엔티티 변환 매퍼
 */
@Component
@RequiredArgsConstructor
public class MenuMapper {

    private final CategoryMapper categoryMapper;

    public Menu toDomain(MenuJpaEntity entity) {
        if (entity == null) return null;

        Category category = entity.getCategory() != null
                ? categoryMapper.toDomain(entity.getCategory())
                : null;

        return Menu.builder()
                .id(entity.getId())
                .korName(entity.getKorName())
                .engName(entity.getEngName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .categoryId(entity.getCategoryId())
                .isAvailable(entity.getIsAvailable())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .category(category)
                .build();
    }

    public MenuJpaEntity toJpaEntity(Menu domain) {
        if (domain == null) return null;
        return MenuJpaEntity.builder()
                .id(domain.getId())
                .korName(domain.getKorName())
                .engName(domain.getEngName())
                .description(domain.getDescription())
                .price(domain.getPrice())
                .categoryId(domain.getCategoryId())
                .isAvailable(domain.getIsAvailable())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
