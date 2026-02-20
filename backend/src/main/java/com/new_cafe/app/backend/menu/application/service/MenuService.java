package com.new_cafe.app.backend.menu.application.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.new_cafe.app.backend.dto.MenuCreateRequest;
import com.new_cafe.app.backend.dto.MenuCreateResponse;
import com.new_cafe.app.backend.dto.MenuDetailResponse;
import com.new_cafe.app.backend.dto.MenuImageListResponse;
import com.new_cafe.app.backend.dto.MenuListRequest;
import com.new_cafe.app.backend.dto.MenuListResponse;
import com.new_cafe.app.backend.dto.MenuResponse;
import com.new_cafe.app.backend.dto.MenuUpdateRequest;
import com.new_cafe.app.backend.dto.MenuUpdateResponse;
import com.new_cafe.app.backend.menu.application.port.in.MenuUseCase;
import com.new_cafe.app.backend.menu.application.port.out.LoadMenuPort;
import com.new_cafe.app.backend.menu.application.port.out.SaveMenuPort;
import com.new_cafe.app.backend.menu.domain.Menu;
import com.new_cafe.app.backend.menu.domain.MenuImage;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MenuService implements MenuUseCase {

    private final LoadMenuPort loadMenuPort;
    private final SaveMenuPort saveMenuPort;

    @Override
    public MenuListResponse getMenus(MenuListRequest request) {
        Integer categoryId = request.getCategoryId();
        String searchQuery = request.getSearchQuery();

        List<Menu> menus = loadMenuPort.loadMenusByQuery(categoryId, searchQuery);

        List<MenuResponse> menuResponses = menus.stream()
                .map(menu -> {
                    List<MenuImage> images = loadMenuPort.loadMenuImages(menu.getId());
                    String imageSrc = images.isEmpty() ? null : images.get(0).getSrcUrl();

                    return MenuResponse.builder()
                            .id(menu.getId())
                            .korName(menu.getKorName())
                            .engName(menu.getEngName())
                            .description(menu.getDescription())
                            .price(menu.getPrice())
                            .categoryId(menu.getCategoryId())
                            // Example, assuming we don't fetch category details here for simplicity or
                            // separate port call
                            .categoryName(null)
                            .imageSrc(imageSrc)
                            .isAvailable(menu.getIsAvailable())
                            .isSoldOut(false)
                            .sortOrder(0)
                            .createdAt(menu.getCreatedAt())
                            .updatedAt(menu.getUpdatedAt())
                            .build();
                })
                .toList();

        return MenuListResponse.builder()
                .menus(menuResponses)
                .total(menus.size()) // Adjusted to actual size or separate count query
                .build();
    }

    @Override
    public MenuDetailResponse getMenu(Long id) {
        Menu menu = loadMenuPort.loadMenu(id);
        if (menu == null)
            return null;

        return MenuDetailResponse.builder()
                .id(menu.getId())
                .korName(menu.getKorName())
                .engName(menu.getEngName())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .categoryId(menu.getCategoryId())
                .categoryName("Unknown") // Placeholder
                .imageSrc(null) // Placeholder
                .isAvailable(menu.getIsAvailable())
                .isSoldOut(false)
                .sortOrder(1)
                .createdAt(menu.getCreatedAt())
                .updatedAt(menu.getUpdatedAt())
                .build();
    }

    @Override
    public MenuCreateResponse createMenu(MenuCreateRequest request) {
        // Implement mapping and call saveMenuPort
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public MenuUpdateResponse updateMenu(MenuUpdateRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void deleteMenu(Long id) {
        saveMenuPort.deleteMenu(id);
    }

    @Override
    public MenuImageListResponse getMenuImages(Long id) {
        Menu menu = loadMenuPort.loadMenu(id);
        if (menu == null)
            return null;

        List<MenuImage> menuImages = loadMenuPort.loadMenuImages(id);
        List<MenuImageListResponse.MenuImageDto> images = new ArrayList<>();

        for (int i = 0; i < menuImages.size(); i++) {
            MenuImage img = menuImages.get(i);
            boolean isPrimary = (i == 0);

            images.add(MenuImageListResponse.MenuImageDto.builder()
                    .id(img.getId())
                    .url(img.getSrcUrl())
                    .altText(menu.getKorName())
                    .isPrimary(isPrimary)
                    .sortOrder(img.getSortOrder())
                    .build());
        }

        return MenuImageListResponse.builder()
                .menuId(menu.getId())
                .menuName(menu.getKorName())
                .images(images)
                .build();
    }
}
