package com.new_cafe.app.backend.category.adapter.out.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import com.new_cafe.app.backend.category.adapter.out.persistence.entity.CategoryJpaEntity;

public interface CategoryJpaRepository extends JpaRepository<CategoryJpaEntity, Integer> {
}
