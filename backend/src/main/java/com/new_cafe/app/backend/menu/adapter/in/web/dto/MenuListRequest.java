package com.new_cafe.app.backend.menu.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 목록 조회 요청 DTO (Web Adapter 계층)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuListRequest {
    private Integer categoryId;
    private String searchQuery;
}
