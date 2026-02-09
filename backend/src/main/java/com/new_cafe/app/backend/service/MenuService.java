package com.new_cafe.app.backend.service;

import com.new_cafe.app.backend.dto.MenuCreateRequest;
import com.new_cafe.app.backend.dto.MenuCreateResponse;
import com.new_cafe.app.backend.dto.MenuDetailResponse;
import com.new_cafe.app.backend.dto.MenuListRequest;
import com.new_cafe.app.backend.dto.MenuListResponse;
import com.new_cafe.app.backend.dto.MenuUpdateRequest;
import com.new_cafe.app.backend.dto.MenuUpdateResponse;
import com.new_cafe.app.backend.dto.MenuImageListResponse;

public interface MenuService {
    MenuListResponse getMenus(MenuListRequest request);

    MenuDetailResponse getMenu(Long id);

    MenuImageListResponse getMenuImages(Long id);

    MenuCreateResponse createMenu(MenuCreateRequest request);

    void deleteMenu(Long id);

    MenuUpdateResponse updateMenu(MenuUpdateRequest request);
}
