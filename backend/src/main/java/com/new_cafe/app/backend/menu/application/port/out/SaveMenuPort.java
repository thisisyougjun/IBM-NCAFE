package com.new_cafe.app.backend.menu.application.port.out;

import com.new_cafe.app.backend.menu.domain.Menu;

public interface SaveMenuPort {
    Menu saveMenu(Menu menu);

    void deleteMenu(Long id);

    void updateMenu(Menu menu);
}
