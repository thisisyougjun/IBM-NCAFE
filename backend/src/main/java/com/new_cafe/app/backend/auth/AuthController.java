            package com.new_cafe.app.backend.auth;

import com.new_cafe.app.backend.user.domain.Role;
import com.new_cafe.app.backend.user.adapter.out.persistence.RoleRepository;
import com.new_cafe.app.backend.user.domain.User;
import com.new_cafe.app.backend.user.adapter.out.persistence.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenService refreshTokenService;

    @Value("${admin.username}")
    private String adminUsername;

    // 환경변수에서 읽은 평문 비밀번호 → 시작 시 즉시 BCrypt 해싱
    @Value("${admin.password}")
    private String rawAdminPassword;

    private String adminPasswordHash; // BCrypt 해시 (런타임 only)

    /**
     * 애플리케이션 시작 시 관리자 비밀번호를 BCrypt로 해싱
     * 이후 rawAdminPassword는 메모리에서 제거
     */
    @PostConstruct
    public void init() {
        this.adminPasswordHash = passwordEncoder.encode(rawAdminPassword);
        this.rawAdminPassword = null; // 평문 메모리 제거
        log.info("Admin credentials initialized (BCrypt hashed).");
    }

    // ── 관리자 로그인 ─────────────────────────────────────────────────────────
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody AdminLoginRequest request,
                                        HttpServletResponse response) {
        if (!adminUsername.equals(request.username())) {
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }
        // BCrypt 비교 (기존 평문 비교 → 타이밍 공격 방어)
        if (!passwordEncoder.matches(request.password(), adminPasswordHash)) {
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }

        String accessToken  = jwtUtil.generateToken(adminUsername, "ADMIN");
        String refreshToken = refreshTokenService.createRefreshToken(adminUsername, "ADMIN");
        setRefreshCookie(response, refreshToken);

        return ResponseEntity.ok(Map.of(
                "token",    accessToken,
                "username", adminUsername,
                "role",     "ADMIN"
        ));
    }

    // ── 사용자 회원가입 ───────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request,
                                      HttpServletResponse response) {
        if (request.name() == null || request.name().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "이름을 입력해주세요."));
        }
        if (request.username() == null || !request.username().matches("^[a-zA-Z0-9]{4,20}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "아이디는 영문, 숫자 조합 4~20자로 입력해주세요."));
        }
        if (request.email() == null || !request.email().contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "유효한 이메일을 입력해주세요."));
        }
        if (request.password() == null || request.password().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "비밀번호는 8자 이상이어야 합니다."));
        }
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.status(409).body(Map.of("message", "이미 사용 중인 아이디입니다."));
        }
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.status(409).body(Map.of("message", "이미 사용 중인 이메일입니다."));
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));

        User user = User.builder()
                .name(request.name().trim())
                .username(request.username().trim())
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .build();
        user.getRoles().add(userRole);
        userRepository.save(user);

        String accessToken  = jwtUtil.generateToken(user.getUsername(), "USER");
        String refreshToken = refreshTokenService.createRefreshToken(user.getUsername(), "USER");
        setRefreshCookie(response, refreshToken);

        return ResponseEntity.ok(Map.of(
                "token", accessToken,
                "name",  user.getName(),
                "username", user.getUsername(),
                "role",  "USER"
        ));
    }

    // ── 사용자 로그인 ─────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> userLogin(@RequestBody UserLoginRequest request,
                                       HttpServletResponse response) {
        if (request.username() == null || request.password() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "아이디와 비밀번호를 입력해주세요."));
        }

        Optional<User> optUser = userRepository.findByUsername(request.username().trim());
        if (optUser.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }

        User user = optUser.get();
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }

        String accessToken  = jwtUtil.generateToken(user.getUsername(), "USER");
        String refreshToken = refreshTokenService.createRefreshToken(user.getUsername(), "USER");
        setRefreshCookie(response, refreshToken);

        return ResponseEntity.ok(Map.of(
                "token", accessToken,
                "name",  user.getName(),
                "username", user.getUsername(),
                "role",  "USER"
        ));
    }

    // ── Access Token 갱신 (Refresh Token Rotation) ────────────────────────────
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = "refresh_token", required = false) String refreshTokenCookie,
            HttpServletResponse response) {

        if (refreshTokenCookie == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Refresh token이 없습니다."));
        }

        Optional<RefreshToken> optToken = refreshTokenService.findByToken(refreshTokenCookie);
        if (optToken.isEmpty() || optToken.get().isExpired()) {
            clearRefreshCookie(response);
            return ResponseEntity.status(401).body(Map.of("message", "Refresh token이 만료되었거나 유효하지 않습니다."));
        }

        RefreshToken stored = optToken.get();

        // 새 Access Token 발급
        String newAccessToken = jwtUtil.generateToken(stored.getSubject(), stored.getRole());

        // Refresh Token Rotation: 기존 토큰 대체 후 새 쿠키 설정
        String newRefreshToken = refreshTokenService.createRefreshToken(stored.getSubject(), stored.getRole());
        setRefreshCookie(response, newRefreshToken);

        return ResponseEntity.ok(Map.of("token", newAccessToken));
    }

    // ── 로그아웃 ──────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(value = "refresh_token", required = false) String refreshTokenCookie,
            HttpServletResponse response) {

        if (refreshTokenCookie != null) {
            refreshTokenService.deleteByToken(refreshTokenCookie);
        }
        clearRefreshCookie(response);
        return ResponseEntity.ok(Map.of("message", "로그아웃 되었습니다."));
    }

    // ── 토큰 검증 ─────────────────────────────────────────────────────────────
    @GetMapping("/verify")
    public ResponseEntity<?> verify(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("valid", false));
        }
        String token = authHeader.substring(7);
        if (jwtUtil.validateToken(token)) {
            String subject = jwtUtil.extractSubject(token);
            String role    = jwtUtil.extractRole(token);
            return ResponseEntity.ok(Map.of("valid", true, "subject", subject, "role", role));
        }
        return ResponseEntity.status(401).body(Map.of("valid", false));
    }

    // ── Cookie 헬퍼 ──────────────────────────────────────────────────────────

    @Value("${jwt.refresh.expiration.days:7}")
    private long refreshExpirationDays;

    private void setRefreshCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("refresh_token", token);
        cookie.setHttpOnly(true);               // XSS 방어: JS에서 접근 불가
        cookie.setSecure(false);                // HTTPS 환경에서는 true로 변경
        cookie.setPath("/auth");                // /auth 하위 요청에만 전송
        cookie.setMaxAge((int) (refreshExpirationDays * 24 * 60 * 60));
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/auth");
        cookie.setMaxAge(0);                    // 즉시 만료
        response.addCookie(cookie);
    }

    // ── Request Records ───────────────────────────────────────────────────────
    public record AdminLoginRequest(String username, String password) {}
    public record RegisterRequest(String name, String username, String email, String password) {}
    public record UserLoginRequest(String username, String password) {}
}
