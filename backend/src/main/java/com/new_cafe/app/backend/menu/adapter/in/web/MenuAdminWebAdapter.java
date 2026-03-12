package com.new_cafe.app.backend.menu.adapter.in.web;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

import java.sql.PreparedStatement;
import java.sql.Statement;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuCreateRequest;
import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuDetailResponse;
import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuImageListResponse;
import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuListRequest;
import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuListResponse;
import com.new_cafe.app.backend.menu.adapter.in.web.dto.MenuUpdateRequest;
import com.new_cafe.app.backend.menu.application.port.in.MenuUseCase;
import com.new_cafe.app.backend.menu.application.port.in.command.CreateMenuCommand;
import com.new_cafe.app.backend.menu.application.port.in.command.GetMenusCommand;
import com.new_cafe.app.backend.menu.application.port.in.command.UpdateMenuCommand;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuDetailResult;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuImageListResult;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuListResult;

import lombok.RequiredArgsConstructor;
import lombok.Data;

/**
 * 메뉴 관리 Web Adapter (관리자용)
 * - 경로: /admin/menu
 * - 메뉴 등록, 수정, 삭제 및 관리자용 조회 엔드포인트
 */
@RestController
@RequestMapping("/admin/menu")
@RequiredArgsConstructor
public class MenuAdminWebAdapter {

    private final MenuUseCase menuUseCase;
    private final JdbcTemplate jdbcTemplate;

    /** [관리자] 메뉴 목록 조회 */
    @GetMapping
    public MenuListResponse getMenus(MenuListRequest request) {
        GetMenusCommand command = GetMenusCommand.builder()
                .categoryId(request.getCategoryId() != null ? request.getCategoryId().longValue() : null)
                .searchQuery(request.getSearchQuery())
                .build();

        MenuListResult result = menuUseCase.getMenus(command);
        return toListResponse(result);
    }

    /** [관리자] 메뉴 단건 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<MenuDetailResponse> getMenu(@PathVariable Long id) {
        MenuDetailResult result = menuUseCase.getMenu(id);
        if (result == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(toDetailResponse(result));
    }

    /** [관리자] 메뉴 등록 */
    @PostMapping
    public ResponseEntity<MenuDetailResponse> createMenu(@RequestBody MenuCreateRequest request) {
        CreateMenuCommand command = CreateMenuCommand.builder()
                .korName(request.getKorName())
                .engName(request.getEngName())
                .description(request.getDescription())
                .price(request.getPrice())
                .categoryId(request.getCategoryId())
                .isAvailable(request.getIsAvailable())
                .isSoldOut(request.getIsSoldOut())
                .build();

        MenuDetailResult result = menuUseCase.createMenu(command);
        return ResponseEntity.ok(toDetailResponse(result));
    }

    /** [관리자] 메뉴 수정 */
    @PutMapping("/{id}")
    public ResponseEntity<MenuDetailResponse> updateMenu(
            @PathVariable Long id,
            @RequestBody MenuUpdateRequest request) {

        UpdateMenuCommand command = UpdateMenuCommand.builder()
                .id(id)
                .korName(request.getKorName())
                .engName(request.getEngName())
                .description(request.getDescription())
                .price(request.getPrice())
                .categoryId(request.getCategoryId())
                .isAvailable(request.getIsAvailable())
                .isSoldOut(request.getIsSoldOut())
                .build();

        MenuDetailResult result = menuUseCase.updateMenu(command);
        return ResponseEntity.ok(toDetailResponse(result));
    }

    /** [관리자] 메뉴 삭제 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuUseCase.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }

    /** [관리자] 메뉴 이미지 목록 조회 */
    @GetMapping("/{id}/menu-images")
    public ResponseEntity<MenuImageListResponse> getMenuImages(@PathVariable Long id) {
        MenuImageListResult result = menuUseCase.getMenuImages(id);
        if (result == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(toImageListResponse(result));
    }

    /** [관리자] 메뉴 옵션 조회 */
    @GetMapping("/{id}/options")
    public ResponseEntity<Map<String, Object>> getMenuOptions(@PathVariable Long id) {
        MenuDetailResult menu = menuUseCase.getMenu(id);
        if (menu == null) return ResponseEntity.notFound().build();

        List<Map<String, Object>> optionRows = jdbcTemplate.queryForList(
                """
                SELECT id, name, type, is_required, display_order
                FROM menu_options
                WHERE menu_id = ?
                ORDER BY display_order, id
                """,
                id
        );

        List<Map<String, Object>> options = optionRows.stream().map(option -> {
            Long optionId = ((Number) option.get("id")).longValue();
            List<Map<String, Object>> itemRows = jdbcTemplate.queryForList(
                    """
                    SELECT id, name, price_delta, is_available, display_order
                    FROM menu_option_items
                    WHERE option_id = ?
                    ORDER BY display_order, id
                    """,
                    optionId
            );

            List<Map<String, Object>> items = itemRows.stream().map(item -> {
                Map<String, Object> itemMap = new LinkedHashMap<>();
                itemMap.put("id", String.valueOf(((Number) item.get("id")).longValue()));
                itemMap.put("name", item.get("name"));
                itemMap.put("priceDelta", item.get("price_delta") != null ? ((Number) item.get("price_delta")).intValue() : 0);
                itemMap.put("isAvailable", item.get("is_available") != null ? item.get("is_available") : true);
                return itemMap;
            }).toList();

            Map<String, Object> optionMap = new LinkedHashMap<>();
            optionMap.put("id", String.valueOf(optionId));
            optionMap.put("name", option.get("name"));
            optionMap.put("type", option.get("type") != null ? option.get("type") : "radio");
            optionMap.put("required", option.get("is_required") != null ? option.get("is_required") : false);
            optionMap.put("items", items);
            return optionMap;
        }).toList();

        return ResponseEntity.ok(Map.of("options", options));
    }

    /** [관리자] 메뉴 옵션 수정 */
    @PutMapping("/{id}/options")
    public ResponseEntity<Map<String, Object>> updateMenuOptions(
            @PathVariable Long id,
            @RequestBody MenuOptionsUpdateRequest request) {
        MenuDetailResult menu = menuUseCase.getMenu(id);
        if (menu == null) return ResponseEntity.notFound().build();

        jdbcTemplate.update(
                "DELETE FROM menu_option_items WHERE option_id IN (SELECT id FROM menu_options WHERE menu_id = ?)",
                id
        );
        jdbcTemplate.update("DELETE FROM menu_options WHERE menu_id = ?", id);

        List<MenuOptionRequest> options = request.getOptions();
        if (options != null) {
            for (int optionOrder = 0; optionOrder < options.size(); optionOrder++) {
                MenuOptionRequest option = options.get(optionOrder);
                if (option == null || option.getName() == null || option.getName().isBlank()) continue;
                final int currentOptionOrder = optionOrder;

                KeyHolder keyHolder = new GeneratedKeyHolder();
                jdbcTemplate.update(connection -> {
                    PreparedStatement ps = connection.prepareStatement(
                            """
                            INSERT INTO menu_options (menu_id, name, type, is_required, display_order)
                            VALUES (?, ?, ?, ?, ?)
                            """,
                            Statement.RETURN_GENERATED_KEYS
                    );
                    ps.setLong(1, id);
                    ps.setString(2, option.getName());
                    ps.setString(3, option.getType() != null ? option.getType() : "radio");
                    ps.setBoolean(4, Boolean.TRUE.equals(option.getRequired()));
                    ps.setInt(5, currentOptionOrder);
                    return ps;
                }, keyHolder);

                Number optionIdNumber = keyHolder.getKey();
                if (optionIdNumber == null) continue;
                Long optionId = optionIdNumber.longValue();

                List<MenuOptionItemRequest> items = option.getItems();
                if (items == null) continue;

                for (int itemOrder = 0; itemOrder < items.size(); itemOrder++) {
                    MenuOptionItemRequest item = items.get(itemOrder);
                    if (item == null || item.getName() == null || item.getName().isBlank()) continue;

                    jdbcTemplate.update(
                            """
                            INSERT INTO menu_option_items (option_id, name, price_delta, display_order, is_available)
                            VALUES (?, ?, ?, ?, ?)
                            """,
                            optionId,
                            item.getName(),
                            item.getPriceDelta() != null ? item.getPriceDelta() : 0,
                            itemOrder,
                            item.getIsAvailable() == null || item.getIsAvailable()
                    );
                }
            }
        }

        return getMenuOptions(id);
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

    @Data
    public static class MenuOptionsUpdateRequest {
        private List<MenuOptionRequest> options;
    }

    @Data
    public static class MenuOptionRequest {
        private String id;
        private String name;
        private String type;
        private Boolean required;
        private List<MenuOptionItemRequest> items;
    }

    @Data
    public static class MenuOptionItemRequest {
        private String id;
        private String name;
        private Integer priceDelta;
        private Boolean isAvailable;
    }
}
