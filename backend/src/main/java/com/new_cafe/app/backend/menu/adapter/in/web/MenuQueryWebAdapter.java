package com.new_cafe.app.backend.menu.adapter.in.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuDetailResponse;
import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuImageListResponse;
import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuListRequest;
import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuListResponse;
import com.new_cafe.app.backend.menu.application.port.in.MenuUseCase;
import com.new_cafe.app.backend.menu.application.port.in.command.GetMenusCommand;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuDetailResult;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuImageListResult;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuListResult;

import lombok.RequiredArgsConstructor;

/**
 * 메뉴 조회 Web Adapter (공개용)
 * - 경로: /menu
 * - 고객이 메뉴를 조회하는 읽기 전용 엔드포인트
 */
@RestController
@RequestMapping("/menu")
@RequiredArgsConstructor
public class MenuQueryWebAdapter {

    private final MenuUseCase menuUseCase;

    /** 메뉴 목록 조회 */
    @GetMapping
    public MenuListResponse getMenus(MenuListRequest request) {
        GetMenusCommand command = GetMenusCommand.builder()
                .categoryId(request.getCategoryId() != null ? request.getCategoryId().longValue() : null)
                .searchQuery(request.getSearchQuery())
                .build();

        MenuListResult result = menuUseCase.getMenus(command);
        return toListResponse(result);
    }

    /** 메뉴 단건 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<MenuDetailResponse> getMenu(@PathVariable Long id) {
        MenuDetailResult result = menuUseCase.getMenu(id);
        if (result == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(toDetailResponse(result));
    }

    /** 메뉴 이미지 목록 조회 */
    @GetMapping("/{id}/images")
    public ResponseEntity<MenuImageListResponse> getMenuImages(@PathVariable Long id) {
        MenuImageListResult result = menuUseCase.getMenuImages(id);
        if (result == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(toImageListResponse(result));
    }

    // ---- 변환 헬퍼 (Result → Response DTO) ----

    private MenuListResponse toListResponse(MenuListResult result) {
        List<MenuListResponse.MenuItemResponse> items = result.getMenus().stream()
                .map(item -> MenuListResponse.MenuItemResponse.builder()
                        .id(item.getId())
                        .korName(item.getKorName())
                        .engName(item.getEngName())
                        .description(item.getDescription())
                        .price(item.getPrice())
                        .categoryId(item.getCategoryId())
                        .categoryName(item.getCategoryName())
                        .imageSrc(item.getImageSrc())
                        .isAvailable(item.getIsAvailable())
                        .isSoldOut(item.getIsSoldOut())
                        .sortOrder(item.getSortOrder())
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .build())
                .toList();

        return MenuListResponse.builder()
                .menus(items)
                .total(result.getTotal())
                .build();
    }

    private MenuDetailResponse toDetailResponse(MenuDetailResult result) {
        return MenuDetailResponse.builder()
                .id(result.getId())
                .korName(result.getKorName())
                .engName(result.getEngName())
                .description(result.getDescription())
                .price(result.getPrice())
                .categoryId(result.getCategoryId())
                .categoryName(result.getCategoryName())
                .imageSrc(result.getImageSrc())
                .isAvailable(result.getIsAvailable())
                .isSoldOut(result.getIsSoldOut())
                .sortOrder(result.getSortOrder())
                .createdAt(result.getCreatedAt())
                .updatedAt(result.getUpdatedAt())
                .build();
    }

    private MenuImageListResponse toImageListResponse(MenuImageListResult result) {
        List<MenuImageListResponse.MenuImageItemResponse> images = result.getImages().stream()
                .map(img -> MenuImageListResponse.MenuImageItemResponse.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .altText(img.getAltText())
                        .isPrimary(img.getIsPrimary())
                        .sortOrder(img.getSortOrder())
                        .build())
                .toList();

        return MenuImageListResponse.builder()
                .menuId(result.getMenuId())
                .menuName(result.getMenuName())
                .images(images)
                .build();
    }
}
