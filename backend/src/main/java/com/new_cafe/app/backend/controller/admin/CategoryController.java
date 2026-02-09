package com.new_cafe.app.backend.controller.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import com.new_cafe.app.backend.entity.Category;
import com.new_cafe.app.backend.service.CategoryService;

@RestController
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // 목록 조회 데이터 반환
    @GetMapping("/admin/categories")
    public List<Category> categories() {
        return categoryService.getAll();
    }

    // 상세 조회 데이터 반환
    @GetMapping("/admin/categories/{id}")
    public String detail() {
        return "detail";
    }

    // 카테고리 생성 데이터 입력
    @PostMapping("/admin/categories")
    public String newCategory(Category category) {
        return "newCategory";
    }

    @PutMapping("/admin/categories/{id}")
    public String editCategory(Category category) {
        // TODO: process PUT request
        return "editCategory";
    }

    // 카테고리 삭제 데이터 입력
    @DeleteMapping("/admin/categories/{id}")
    public String deleteCategory() {
        return "deleteCategory";
    }
}
