package com.new_cafe.app.backend.menu.adapter.out.persistence.jpa;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.new_cafe.app.backend.menu.adapter.out.persistence.entity.MenuImageJpaEntity;

public interface MenuImageJpaRepository extends JpaRepository<MenuImageJpaEntity, Long> {

    List<MenuImageJpaEntity> findByMenuIdOrderBySortOrderAsc(Long menuId);
}
