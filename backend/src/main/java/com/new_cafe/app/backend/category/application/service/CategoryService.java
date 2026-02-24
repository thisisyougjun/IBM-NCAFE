package com.new_cafe.app.backend.category.application.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.new_cafe.app.backend.category.application.port.in.CategoryUseCase;
import com.new_cafe.app.backend.category.application.port.out.LoadCategoryPort;
import com.new_cafe.app.backend.category.domain.model.Category;

import lombok.RequiredArgsConstructor;

/**
 * 카테고리 유스케이스 구현체 (Application Service)
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CategoryService implements CategoryUseCase {

    private final LoadCategoryPort loadCategoryPort;

    @Override
    public List<Category> getCategories() {
        return loadCategoryPort.findAll();
    }
}
