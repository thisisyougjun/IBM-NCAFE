package com.new_cafe.app.backend.menu.application.port.out;

import com.new_cafe.app.backend.menu.domain.model.Menu;

/**
 * 메뉴 저장 아웃바운드 포트
 */
public interface SaveMenuPort {

    Menu save(Menu menu);
}
