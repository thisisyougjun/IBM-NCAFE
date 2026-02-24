package com.new_cafe.app.backend.category.application.port.in;

import java.util.List;

import com.new_cafe.app.backend.category.domain.model.Category;

/**
 * 카테고리 인바운드 포트 (유스케이스 인터페이스)
 */
public interface CategoryUseCase {

    List<Category> getCategories();
}
