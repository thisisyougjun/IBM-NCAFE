package com.new_cafe.app.backend.menu.adapter.out.persistence.jpa;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.new_cafe.app.backend.menu.adapter.out.persistence.entity.MenuJpaEntity;

public interface MenuJpaRepository extends JpaRepository<MenuJpaEntity, Long> {

    @Query("SELECT m FROM MenuJpaEntity m WHERE " +
           "(:categoryId IS NULL OR m.categoryId = :categoryId) AND " +
           "(:searchQuery IS NULL OR :searchQuery = '' OR m.korName LIKE %:searchQuery%)")
    List<MenuJpaEntity> findAllByCategoryAndSearchQuery(
            @Param("categoryId") Long categoryId,
            @Param("searchQuery") String searchQuery);
}
