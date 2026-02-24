package com.new_cafe.app.backend.menu.application.port.in;

import com.new_cafe.app.backend.menu.application.port.in.command.CreateMenuCommand;
import com.new_cafe.app.backend.menu.application.port.in.command.GetMenusCommand;
import com.new_cafe.app.backend.menu.application.port.in.command.UpdateMenuCommand;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuDetailResult;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuImageListResult;
import com.new_cafe.app.backend.menu.application.port.in.result.MenuListResult;

/**
 * 메뉴 인바운드 포트 (유스케이스 인터페이스)
 * - 외부(Web) → 애플리케이션 진입점 정의
 */
public interface MenuUseCase {

    MenuListResult getMenus(GetMenusCommand command);

    MenuDetailResult getMenu(Long id);

    MenuImageListResult getMenuImages(Long id);

    MenuDetailResult createMenu(CreateMenuCommand command);

    MenuDetailResult updateMenu(UpdateMenuCommand command);

    void deleteMenu(Long id);
}
