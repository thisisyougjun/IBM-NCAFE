package com.new_cafe.app.backend.menu.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 생성 요청 DTO (Web Adapter 계층)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCreateRequest {
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private Boolean isAvailable;
}
