package com.new_cafe.app.backend.user.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "permissions", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name; // e.g., "READ_USER", "WRITE_POST"
}
