package com.new_cafe.app.backend.menu.application.port.in.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메뉴 목록 조회 커맨드
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetMenusCommand {
    private Long categoryId;
    private String searchQuery;
}
