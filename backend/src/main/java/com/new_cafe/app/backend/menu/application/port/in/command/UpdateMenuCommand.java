package com.new_cafe.app.backend.menu.application.port.in.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메뉴 수정 커맨드
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMenuCommand {
    private Long id;
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private Boolean isAvailable;
}
