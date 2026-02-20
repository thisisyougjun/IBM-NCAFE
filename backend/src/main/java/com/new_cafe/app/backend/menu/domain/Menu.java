package com.new_cafe.app.backend.menu.domain;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Menu {
    private Long id;
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // In strict hexagonal, domain entities shouldn't depend on other bounded
    // contexts' entities directly if possible,
    // but for simplicity we keep loose coupling.
    // private Category category;
    // private List<MenuImage> images;
}
