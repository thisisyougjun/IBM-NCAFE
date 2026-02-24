package com.new_cafe.app.backend.menu.application.port.in.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메뉴 생성 커맨드
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMenuCommand {
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private Boolean isAvailable;
}
