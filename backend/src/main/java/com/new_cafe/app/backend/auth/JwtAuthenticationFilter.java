package com.new_cafe.app.backend.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                String subject = jwtUtil.extractSubject(token);
                String role = jwtUtil.extractRole(token);
                // 하위 호환: role 값이 ADMIN 또는 ROLE_ADMIN 둘 다 올 수 있음
                String normalizedRole = role != null ? role.trim() : "USER";
                String grantedRole = normalizedRole.startsWith("ROLE_")
                        ? normalizedRole
                        : "ROLE_" + normalizedRole;

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                subject,
                                null,
                                List.of(new SimpleGrantedAuthority(grantedRole)));
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("Authenticated '{}' with role '{}'", subject, grantedRole);
            } else {
                log.debug("Invalid JWT token in request to: {}", request.getRequestURI());
            }
        }
        filterChain.doFilter(request, response);
    }
}
