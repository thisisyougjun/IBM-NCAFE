package com.new_cafe.app.backend.dto;

import java.util.List;
import com.new_cafe.app.backend.entity.Menu;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuListResponse {
    private List<MenuResponse> menus;
    private int total;
}
