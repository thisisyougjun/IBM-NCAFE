package com.new_cafe.app.backend.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Refresh Token 관리 서비스
 * - 로그인 시 발급 (기존 토큰 대체)
 * - Refresh 시 토큰 로테이션 (Refresh Token Rotation)
 * - 만료 토큰 자동 정리 (스케줄러)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh.expiration.days:7}")
    private long refreshExpirationDays;

    /**
     * 새 Refresh Token 발급
     * 해당 subject의 기존 토큰을 먼저 삭제하여 단일 세션 보장
     */
    @Transactional
    public String createRefreshToken(String subject, String role) {
        // 기존 토큰 삭제 (단일 세션 정책)
        refreshTokenRepository.deleteBySubject(subject);

        String tokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .subject(subject)
                .role(role)
                .expiresAt(LocalDateTime.now().plusDays(refreshExpirationDays))
                .build();

        refreshTokenRepository.save(refreshToken);
        log.debug("Refresh token issued for subject: {}", subject);
        return tokenValue;
    }

    @Transactional(readOnly = true)
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public void deleteBySubject(String subject) {
        refreshTokenRepository.deleteBySubject(subject);
        log.debug("Refresh token revoked for subject: {}", subject);
    }

    @Transactional
    public void deleteByToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(rt -> {
                    refreshTokenRepository.delete(rt);
                    log.debug("Refresh token deleted for subject: {}", rt.getSubject());
                });
    }

    /**
     * 만료된 Refresh Token 정리 (매일 새벽 3시)
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        refreshTokenRepository.deleteAllExpiredBefore(LocalDateTime.now());
        log.info("Expired refresh tokens purged.");
    }
}
