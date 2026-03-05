package com.new_cafe.app.backend.config;

import com.new_cafe.app.backend.auth.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity           // @PreAuthorize("hasRole('ADMIN')") 등 메서드 레벨 보안 활성화
@EnableScheduling               // RefreshTokenService 만료 토큰 정리 스케줄러
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)  // REST API + JWT = CSRF 불필요
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    // ── 인증 없이 접근 가능한 공개 엔드포인트 ─────────────────────────
                    .requestMatchers("/auth/**").permitAll()            // 로그인/회원가입/refresh/logout
                    .requestMatchers(HttpMethod.GET, "/categories/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/menu/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/admin/categories/**").permitAll()
                    .requestMatchers("/images/**").permitAll()

                    // ── 관리자 전용 엔드포인트 ─────────────────────────────────────
                    .requestMatchers("/admin/**").hasRole("ADMIN")

                    // ── 나머지 모든 요청은 인증 필수 ──────────────────────────────
                    .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
