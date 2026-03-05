package com.new_cafe.app.backend.auth;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Refresh Token 엔티티
 * - subject: 사용자 식별자 (일반 사용자 = email, 관리자 = adminUsername)
 * - role: ADMIN | USER
 * - expiresAt: 만료 시각 (기본 7일)
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_token_token",   columnList = "token",   unique = true),
        @Index(name = "idx_refresh_token_subject", columnList = "subject")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID v4 문자열 - 실제 토큰 값 */
    @Column(nullable = false, unique = true, length = 64)
    private String token;

    /** 사용자 식별자 (email 또는 adminUsername) */
    @Column(nullable = false, length = 100)
    private String subject;

    /** 권한 (ADMIN | USER) */
    @Column(nullable = false, length = 20)
    private String role;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
