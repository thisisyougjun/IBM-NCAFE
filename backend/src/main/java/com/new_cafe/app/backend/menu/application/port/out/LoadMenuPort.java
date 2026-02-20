package com.new_cafe.app.backend.menu.application.port.out;

import java.util.List;
import com.new_cafe.app.backend.menu.domain.Menu;
import com.new_cafe.app.backend.menu.domain.MenuImage;

public interface LoadMenuPort {
    Menu loadMenu(Long id);

    List<Menu> loadAllMenus();

    List<Menu> loadMenusByCategory(Integer categoryId);

    List<Menu> loadMenusByQuery(Integer categoryId, String searchQuery);

    // Also include image loading capability here or in separate port
    List<MenuImage> loadMenuImages(Long menuId);
}
