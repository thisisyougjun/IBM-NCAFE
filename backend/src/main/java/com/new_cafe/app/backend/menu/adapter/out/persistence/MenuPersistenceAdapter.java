package com.new_cafe.app.backend.menu.adapter.out.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.new_cafe.app.backend.menu.adapter.out.persistence.jpa.MenuJpaRepository;
import com.new_cafe.app.backend.menu.adapter.out.persistence.mapper.MenuMapper;
import com.new_cafe.app.backend.menu.application.port.out.DeleteMenuPort;
import com.new_cafe.app.backend.menu.application.port.out.LoadMenuPort;
import com.new_cafe.app.backend.menu.application.port.out.SaveMenuPort;
import com.new_cafe.app.backend.menu.domain.model.Menu;

import lombok.RequiredArgsConstructor;

/**
 * 메뉴 Persistence Adapter
 * - 아웃바운드 포트(LoadMenuPort, SaveMenuPort, DeleteMenuPort) 구현
 * - Spring Data JPA 리포지토리를 통해 DB와 통신
 * - 도메인 모델 ↔ JPA 엔티티 변환 담당
 */
@Component
@RequiredArgsConstructor
public class MenuPersistenceAdapter implements LoadMenuPort, SaveMenuPort, DeleteMenuPort {

    private final MenuJpaRepository menuJpaRepository;
    private final MenuMapper menuMapper;

    @Override
    public Optional<Menu> findById(Long id) {
        return menuJpaRepository.findById(id)
                .map(menuMapper::toDomain);
    }

    @Override
    public List<Menu> findAll() {
        return menuJpaRepository.findAll().stream()
                .map(menuMapper::toDomain)
                .toList();
    }

    @Override
    public List<Menu> findAllByCategoryAndSearchQuery(Long categoryId, String searchQuery) {
        return menuJpaRepository.findAllByCategoryAndSearchQuery(categoryId, searchQuery)
                .stream()
                .map(menuMapper::toDomain)
                .toList();
    }

    @Override
    public Menu save(Menu menu) {
        return menuMapper.toDomain(
                menuJpaRepository.save(menuMapper.toJpaEntity(menu)));
    }

    @Override
    public void deleteById(Long id) {
        menuJpaRepository.deleteById(id);
    }
}
