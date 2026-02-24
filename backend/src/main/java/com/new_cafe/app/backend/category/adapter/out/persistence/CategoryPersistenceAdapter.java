package com.new_cafe.app.backend.category.adapter.out.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.new_cafe.app.backend.category.adapter.out.persistence.jpa.CategoryJpaRepository;
import com.new_cafe.app.backend.category.adapter.out.persistence.mapper.CategoryMapper;
import com.new_cafe.app.backend.category.application.port.out.LoadCategoryPort;
import com.new_cafe.app.backend.category.domain.model.Category;

import lombok.RequiredArgsConstructor;

/**
 * 카테고리 Persistence Adapter
 * - 아웃바운드 포트(LoadCategoryPort) 구현
 */
@Component
@RequiredArgsConstructor
public class CategoryPersistenceAdapter implements LoadCategoryPort {

    private final CategoryJpaRepository categoryJpaRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public List<Category> findAll() {
        return categoryJpaRepository.findAll().stream()
                .map(categoryMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Category> findById(Integer id) {
        return categoryJpaRepository.findById(id)
                .map(categoryMapper::toDomain);
    }
}
