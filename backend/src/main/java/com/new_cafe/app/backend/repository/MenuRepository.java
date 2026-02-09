package com.new_cafe.app.backend.repository;

import java.util.List;

import com.new_cafe.app.backend.entity.Menu;

public interface MenuRepository {
    Menu findById(Long id);
    
    List<Menu> findAll();

    List<Menu> findAllByName(String name);

    List<Menu> findAllByCategoryId(Integer categoryId);

    List<Menu> findAllByCategoryAndSearchQuery(Integer categoryId, String searchQuery);
}

