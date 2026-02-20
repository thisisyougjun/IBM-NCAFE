package com.new_cafe.app.backend.menu.adapter.in.web;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.new_cafe.app.backend.dto.MenuCreateRequest;
import com.new_cafe.app.backend.dto.MenuCreateResponse;
import com.new_cafe.app.backend.dto.MenuDetailResponse;
import com.new_cafe.app.backend.dto.MenuImageListResponse;
import com.new_cafe.app.backend.dto.MenuListRequest;
import com.new_cafe.app.backend.dto.MenuListResponse;
import com.new_cafe.app.backend.dto.MenuUpdateRequest;
import com.new_cafe.app.backend.dto.MenuUpdateResponse;
import com.new_cafe.app.backend.menu.application.port.in.MenuUseCase;

@RestController
@RequestMapping("/admin/menus")
public class MenuController {

    private final MenuUseCase menuUseCase;

    public MenuController(MenuUseCase menuUseCase) {
        this.menuUseCase = menuUseCase;
    }

    @GetMapping
    public MenuListResponse getMenus(MenuListRequest request) {
        return menuUseCase.getMenus(request);
    }

    @GetMapping("/{id}")
    public MenuDetailResponse getMenu(@PathVariable Long id) {
        return menuUseCase.getMenu(id);
    }

    @PostMapping
    public MenuCreateResponse createMenu(MenuCreateRequest request) {
        return menuUseCase.createMenu(request);
    }

    @PutMapping("/{id}")
    public MenuUpdateResponse updateMenu(MenuUpdateRequest request) {
        return menuUseCase.updateMenu(request);
    }

    @DeleteMapping("/{id}")
    public void deleteMenu(@PathVariable Long id) {
        menuUseCase.deleteMenu(id);
    }

    @GetMapping("/{id}/menu-images")
    public MenuImageListResponse getMenuImages(@PathVariable Long id) {
        return menuUseCase.getMenuImages(id);
    }
}
