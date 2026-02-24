package com.new_cafe.app.backend.menu.application.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.new_cafe.app.backend.menu.application.port.in.MenuUseCase;
import com.new_cafe.app.backend.menu.application.port.in.command.CreateMenuCommand;
import com.new_cafe.app.backend.menu.application.port.in.command.GetMenusCommand;
import com.new_cafe.app.backend.menu.application.port.in.command.UpdateMenuCommand;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuDetailResult;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuImageListResult;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuListResult;
import com.new_cafe.app.backend.menu.application.port.out.DeleteMenuPort;
import com.new_cafe.app.backend.menu.application.port.out.LoadMenuImagePort;
import com.new_cafe.app.backend.menu.application.port.out.LoadMenuPort;
import com.new_cafe.app.backend.menu.application.port.out.SaveMenuPort;
import com.new_cafe.app.backend.menu.domain.model.Menu;
import com.new_cafe.app.backend.menu.domain.model.MenuImage;

import lombok.RequiredArgsConstructor;

/**
 * 메뉴 유스케이스 구현체 (Application Service)
 * - 인바운드 포트(MenuUseCase)를 구현
 * - 아웃바운드 포트(Load/Save/DeleteMenuPort)를 사용
 * - 비즈니스 로직만 담당, 인프라 세부사항 모름
 */
@Service
@Transactional
@RequiredArgsConstructor
public class MenuService implements MenuUseCase {

    private final LoadMenuPort loadMenuPort;
    private final SaveMenuPort saveMenuPort;
    private final DeleteMenuPort deleteMenuPort;
    private final LoadMenuImagePort loadMenuImagePort;

    @Override
    @Transactional(readOnly = true)
    public MenuListResult getMenus(GetMenusCommand command) {
        List<Menu> menus = loadMenuPort.findAllByCategoryAndSearchQuery(
                command.getCategoryId(),
                command.getSearchQuery());

        List<MenuListResult.MenuItemResult> items = menus.stream()
                .map(menu -> {
                    List<MenuImage> images = loadMenuImagePort.findByMenuIdOrderBySortOrder(menu.getId());
                    String imageSrc = images.isEmpty() ? null : images.get(0).getSrcUrl();

                    return MenuListResult.MenuItemResult.builder()
                            .id(menu.getId())
                            .korName(menu.getKorName())
                            .engName(menu.getEngName())
                            .description(menu.getDescription())
                            .price(menu.getPrice())
                            .categoryId(menu.getCategoryId())
                            .categoryName(menu.getCategory() != null ? menu.getCategory().getName() : null)
                            .imageSrc(imageSrc)
                            .isAvailable(menu.getIsAvailable())
                            .isSoldOut(false)
                            .sortOrder(0)
                            .createdAt(menu.getCreatedAt())
                            .updatedAt(menu.getUpdatedAt())
                            .build();
                })
                .toList();

        return MenuListResult.builder()
                .menus(items)
                .total(items.size())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MenuDetailResult getMenu(Long id) {
        Menu menu = loadMenuPort.findById(id).orElse(null);
        if (menu == null) return null;
        return toDetailResult(menu);
    }

    @Override
    @Transactional(readOnly = true)
    public MenuImageListResult getMenuImages(Long id) {
        Menu menu = loadMenuPort.findById(id).orElse(null);
        if (menu == null) return null;

        List<MenuImage> menuImages = loadMenuImagePort.findByMenuIdOrderBySortOrder(id);

        List<MenuImageListResult.MenuImageItemResult> images = menuImages.stream()
                .map((MenuImage img) -> MenuImageListResult.MenuImageItemResult.builder()
                        .id(img.getId())
                        .url(img.getSrcUrl())
                        .altText(menu.getKorName())
                        .isPrimary(menuImages.indexOf(img) == 0)
                        .sortOrder(img.getSortOrder())
                        .build())
                .toList();

        return MenuImageListResult.builder()
                .menuId(menu.getId())
                .menuName(menu.getKorName())
                .images(images)
                .build();
    }

    @Override
    public MenuDetailResult createMenu(CreateMenuCommand command) {
        Menu newMenu = Menu.builder()
                .korName(command.getKorName())
                .engName(command.getEngName())
                .description(command.getDescription())
                .price(command.getPrice())
                .categoryId(command.getCategoryId())
                .isAvailable(command.getIsAvailable() != null ? command.getIsAvailable() : true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Menu saved = saveMenuPort.save(newMenu);
        return toDetailResult(saved);
    }

    @Override
    public MenuDetailResult updateMenu(UpdateMenuCommand command) {
        Menu existing = loadMenuPort.findById(command.getId())
                .orElseThrow(() -> new IllegalArgumentException("메뉴를 찾을 수 없습니다: " + command.getId()));

        Menu updated = Menu.builder()
                .id(existing.getId())
                .korName(command.getKorName() != null ? command.getKorName() : existing.getKorName())
                .engName(command.getEngName() != null ? command.getEngName() : existing.getEngName())
                .description(command.getDescription() != null ? command.getDescription() : existing.getDescription())
                .price(command.getPrice() != null ? command.getPrice() : existing.getPrice())
                .categoryId(command.getCategoryId() != null ? command.getCategoryId() : existing.getCategoryId())
                .isAvailable(command.getIsAvailable() != null ? command.getIsAvailable() : existing.getIsAvailable())
                .createdAt(existing.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        Menu saved = saveMenuPort.save(updated);
        return toDetailResult(saved);
    }

    @Override
    public void deleteMenu(Long id) {
        deleteMenuPort.deleteById(id);
    }

    // ---- 헬퍼 ----
    private MenuDetailResult toDetailResult(Menu menu) {
        return MenuDetailResult.builder()
                .id(menu.getId())
                .korName(menu.getKorName())
                .engName(menu.getEngName())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .categoryId(menu.getCategoryId())
                .categoryName(menu.getCategory() != null ? menu.getCategory().getName() : null)
                .isAvailable(menu.getIsAvailable())
                .isSoldOut(false)
                .sortOrder(0)
                .createdAt(menu.getCreatedAt())
                .updatedAt(menu.getUpdatedAt())
                .build();
    }
}
