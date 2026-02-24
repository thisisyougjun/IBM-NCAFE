package com.new_cafe.app.backend.menu.application.port.out;

import java.util.List;

import com.new_cafe.app.backend.menu.domain.model.MenuImage;

/**
 * 메뉴 이미지 로드 아웃바운드 포트
 */
public interface LoadMenuImagePort {

    List<MenuImage> findByMenuIdOrderBySortOrder(Long menuId);
}
