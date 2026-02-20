package com.new_cafe.app.backend.menu.adapter.out.persistence;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.new_cafe.app.backend.menu.application.port.out.LoadMenuPort;
import com.new_cafe.app.backend.menu.application.port.out.SaveMenuPort;
import com.new_cafe.app.backend.menu.domain.Menu;
import com.new_cafe.app.backend.menu.domain.MenuImage;
import com.new_cafe.app.backend.repository.MenuImageRepository;
import com.new_cafe.app.backend.repository.MenuRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MenuPersistenceAdapter implements LoadMenuPort, SaveMenuPort {

    private final MenuRepository menuRepository;
    private final MenuImageRepository menuImageRepository;

    @Override
    public List<Menu> loadAllMenus() {
        return mapToDomain(menuRepository.findAll());
    }

    @Override
    public List<Menu> loadMenusByQuery(Integer categoryId, String searchQuery) {
        return mapToDomain(menuRepository.findAllByCategoryAndSearchQuery(categoryId, searchQuery));
    }

    @Override
    public Menu loadMenu(Long id) {
        return mapToDomain(menuRepository.findById(id));
    }

    @Override
    public List<Menu> loadMenusByCategory(Integer categoryId) {
        return mapToDomain(menuRepository.findAllByCategoryId(categoryId));
    }

    @Override
    public List<MenuImage> loadMenuImages(Long menuId) {
        List<com.new_cafe.app.backend.entity.MenuImage> entities = menuImageRepository.findAllByMenuId(menuId);
        return entities.stream().map(this::mapToDomain).toList();
    }

    @Override
    public Menu saveMenu(Menu menu) {
        // Implementation for save would go here
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void deleteMenu(Long id) {
        // Implementation for delete would go here
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void updateMenu(Menu menu) {
        // Implementation for update would go here
        throw new UnsupportedOperationException("Not implemented yet");
    }

    // Mappers
    private Menu mapToDomain(com.new_cafe.app.backend.entity.Menu entity) {
        if (entity == null)
            return null;
        return Menu.builder()
                .id(entity.getId())
                .korName(entity.getKorName())
                .engName(entity.getEngName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .categoryId(entity.getCategoryId())
                .isAvailable(entity.getIsAvailable())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private List<Menu> mapToDomain(List<com.new_cafe.app.backend.entity.Menu> entities) {
        return entities.stream().map(this::mapToDomain).toList();
    }

    private MenuImage mapToDomain(com.new_cafe.app.backend.entity.MenuImage entity) {
        if (entity == null)
            return null;
        return MenuImage.builder()
                .id(entity.getId())
                .menuId(entity.getMenuId())
                .srcUrl(entity.getSrcUrl())
                // .isPrimary(entity.getIsPrimary()) // Assuming exists or handled differently
                .sortOrder(entity.getSortOrder())
                .build();
    }
}
