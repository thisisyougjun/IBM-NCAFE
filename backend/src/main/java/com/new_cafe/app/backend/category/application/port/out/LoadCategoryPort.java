package com.new_cafe.app.backend.category.application.port.out;

import java.util.List;
import java.util.Optional;

import com.new_cafe.app.backend.category.domain.model.Category;

/**
 * 카테고리 로드 아웃바운드 포트
 */
public interface LoadCategoryPort {

    List<Category> findAll();

    Optional<Category> findById(Integer id);
}
