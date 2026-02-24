package com.new_cafe.app.backend.menu.application.port.out;

import java.util.List;
import java.util.Optional;

import com.new_cafe.app.backend.menu.domain.model.Menu;

/**
 * 메뉴 로드 아웃바운드 포트
 * - 도메인이 영속성 계층에 데이터 조회를 요청하는 인터페이스
 */
public interface LoadMenuPort {

    Optional<Menu> findById(Long id);

    List<Menu> findAll();

    List<Menu> findAllByCategoryAndSearchQuery(Long categoryId, String searchQuery);
}
