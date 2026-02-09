package com.new_cafe.app.backend.service;

import java.util.List;
import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.new_cafe.app.backend.dto.MenuCreateRequest;
import com.new_cafe.app.backend.dto.MenuCreateResponse;
import com.new_cafe.app.backend.dto.MenuDetailResponse;
import com.new_cafe.app.backend.dto.MenuListRequest;
import com.new_cafe.app.backend.dto.MenuListResponse;
import com.new_cafe.app.backend.dto.MenuUpdateRequest;
import com.new_cafe.app.backend.dto.MenuUpdateResponse;
import com.new_cafe.app.backend.dto.MenuResponse;
import com.new_cafe.app.backend.dto.MenuImageListResponse;
import com.new_cafe.app.backend.entity.Menu;
import com.new_cafe.app.backend.entity.MenuImage;
import com.new_cafe.app.backend.repository.MenuRepository;
import com.new_cafe.app.backend.repository.MenuImageRepository;

@Service
public class NewMenuService implements MenuService {

    private MenuRepository menuRepository;
    private MenuImageRepository menuImageRepository;

    public NewMenuService(MenuRepository menuRepository, MenuImageRepository menuImageRepository) {
        this.menuRepository = menuRepository;
        this.menuImageRepository = menuImageRepository;
    }

    @Override
    public MenuCreateResponse createMenu(MenuCreateRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'createMenu'");
    }

    @Override
    public MenuListResponse getMenus(MenuListRequest request) {

        Integer categoryId = request.getCategoryId();
        String searchQuery = request.getSearchQuery();

        // Menu <----> MenuResponse ----> [] ----> MenuListResponse
        List<Menu> menus = menuRepository.findAllByCategoryAndSearchQuery(categoryId, searchQuery);

        List<MenuResponse> menuResponses = menus
                .stream()
                .map(menu -> {
                    // 이미지 조회
                    List<MenuImage> images = menuImageRepository.findAllByMenuId(menu.getId());
                    String imageSrc = images.isEmpty() ? null : images.get(0).getSrcUrl();

                    return MenuResponse
                            .builder()
                            .id(menu.getId())
                            .korName(menu.getKorName())
                            .engName(menu.getEngName())
                            .description(menu.getDescription())
                            .price(menu.getPrice())
                            .categoryId(menu.getCategoryId())
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

        return MenuListResponse
                .builder()
                .menus(menuResponses)
                .total(100)
                .build();
    }

    @Override
    public MenuDetailResponse getMenu(Long id) {
        Menu menu = menuRepository.findById(id);

        if (menu == null) {
            return null;
        }

        return MenuDetailResponse
                .builder()
                .id(menu.getId())
                .korName(menu.getKorName())
                .engName(menu.getEngName())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .categoryId(menu.getCategoryId())
                .categoryName("커피") // TODO: 실제 카테고리 이름으로 변경
                .imageSrc("/images/coffee.jpg") // TODO: 실제 이미지 경로로 변경
                .isAvailable(menu.getIsAvailable())
                .isSoldOut(false)
                .sortOrder(1)
                .createdAt(menu.getCreatedAt())
                .updatedAt(menu.getUpdatedAt())
                .build();
    }

    @Override
    public MenuImageListResponse getMenuImages(Long id) {
        Menu menu = menuRepository.findById(id);

        if (menu == null) {
            return null;
        }

        // DB에서 이미지 목록 조회
        List<MenuImage> menuImages = menuImageRepository.findAllByMenuId(id);

        // Entity -> DTO 변환
        List<MenuImageListResponse.MenuImageDto> images = new ArrayList<>();

        for (int i = 0; i < menuImages.size(); i++) {
            MenuImage img = menuImages.get(i);
            boolean isPrimary = (i == 0); // 첫 번째 이미지를 대표 이미지로 설정 (sort_order로 정렬되어 있다고 가정)

            images.add(MenuImageListResponse.MenuImageDto.builder()
                    .id(img.getId())
                    .url(img.getSrcUrl())
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

    @Override
    public MenuUpdateResponse updateMenu(MenuUpdateRequest request) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateMenu'");
    }

    @Override
    public void deleteMenu(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteMenu'");
    }

}
