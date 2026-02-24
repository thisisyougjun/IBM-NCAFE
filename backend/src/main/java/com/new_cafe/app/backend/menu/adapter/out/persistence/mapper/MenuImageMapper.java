package com.new_cafe.app.backend.menu.adapter.out.persistence.mapper;

import org.springframework.stereotype.Component;

import com.new_cafe.app.backend.menu.adapter.out.persistence.entity.MenuImageJpaEntity;
import com.new_cafe.app.backend.menu.domain.model.MenuImage;

/**
 * 메뉴 이미지 도메인 모델 ↔ JPA 엔티티 변환 매퍼
 */
@Component
public class MenuImageMapper {

    public MenuImage toDomain(MenuImageJpaEntity entity) {
        if (entity == null) return null;
        return MenuImage.builder()
                .id(entity.getId())
                .menuId(entity.getMenuId())
                .srcUrl(entity.getSrcUrl())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public MenuImageJpaEntity toJpaEntity(MenuImage domain) {
        if (domain == null) return null;
        return MenuImageJpaEntity.builder()
                .id(domain.getId())
                .menuId(domain.getMenuId())
                .srcUrl(domain.getSrcUrl())
                .sortOrder(domain.getSortOrder())
                .createdAt(domain.getCreatedAt())
                .build();
    }
}
