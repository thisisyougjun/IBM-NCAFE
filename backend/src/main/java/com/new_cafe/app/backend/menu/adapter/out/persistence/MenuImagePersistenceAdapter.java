package com.new_cafe.app.backend.menu.adapter.out.persistence;

import java.util.List;

import org.springframework.stereotype.Component;

import com.new_cafe.app.backend.menu.adapter.out.persistence.jpa.MenuImageJpaRepository;
import com.new_cafe.app.backend.menu.adapter.out.persistence.mapper.MenuImageMapper;
import com.new_cafe.app.backend.menu.application.port.out.LoadMenuImagePort;
import com.new_cafe.app.backend.menu.domain.model.MenuImage;

import lombok.RequiredArgsConstructor;

/**
 * 메뉴 이미지 Persistence Adapter
 * - 아웃바운드 포트(LoadMenuImagePort) 구현
 */
@Component
@RequiredArgsConstructor
public class MenuImagePersistenceAdapter implements LoadMenuImagePort {

    private final MenuImageJpaRepository menuImageJpaRepository;
    private final MenuImageMapper menuImageMapper;

    @Override
    public List<MenuImage> findByMenuIdOrderBySortOrder(Long menuId) {
        return menuImageJpaRepository.findByMenuIdOrderBySortOrderAsc(menuId)
                .stream()
                .map(menuImageMapper::toDomain)
                .toList();
    }
}
