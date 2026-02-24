package com.new_cafe.app.backend.menu.application.port.out;

/**
 * 메뉴 삭제 아웃바운드 포트
 */
public interface DeleteMenuPort {

    void deleteById(Long id);
}
