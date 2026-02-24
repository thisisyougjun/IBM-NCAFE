package com.new_cafe.app.backend.category.adapter.in.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.new_cafe.app.backend.category.application.port.in.CategoryUseCase;
import com.new_cafe.app.backend.category.domain.model.Category;

import lombok.RequiredArgsConstructor;

/**
 * 카테고리 Web Adapter (인바운드 어댑터)
 */
@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class CategoryWebAdapter {

    private final CategoryUseCase categoryUseCase;

    @GetMapping
    public List<Category> getCategories() {
        return categoryUseCase.getCategories();
    }
}
