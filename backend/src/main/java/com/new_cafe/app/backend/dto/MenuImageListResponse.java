package com.new_cafe.app.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuImageListResponse {
    private Long menuId;
    private String menuName;
    private List<MenuImageDto> images;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuImageDto {
        private Long id;
        private String url;
        private Boolean isPrimary;
        private Integer sortOrder;
    }
}
