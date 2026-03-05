/**
 * [BFF 전환 후 레거시 파일]
 *
 * 기존 localStorage + document.cookie 방식은 BFF 패턴으로 대체되었습니다.
 * - 저장: app/api/auth/login/route.ts, admin/login/route.ts (iron-session)
 * - 삭제: app/api/auth/logout/route.ts (session.destroy())
 * - 확인: app/api/auth/session/route.ts
 *
 * 이 파일은 하위 호환성을 위해 존재하지만 새로운 코드에서는 사용하지 마세요.
 * AdminHeader의 로그아웃은 authAPI.logout()을 사용합니다.
 */
export function saveToken(_token: string) {
  // BFF 방식: Next.js API Route가 httpOnly 쿠키로 저장 (JS 접근 불가)
  console.warn('[auth.ts] saveToken은 더 이상 사용되지 않습니다. BFF 로그인을 사용하세요.');
}

export function getToken(): string | null {
  // BFF 방식: 브라우저 JS는 JWT에 접근 불가 (의도적인 설계)
  return null;
}

export function removeToken() {
  // BFF 방식: POST /api/auth/logout 으로 서버 세션 삭제
  console.warn('[auth.ts] removeToken은 더 이상 사용되지 않습니다. authAPI.logout()을 사용하세요.');
}

export function isLoggedIn(): boolean {
  // BFF 방식: GET /api/auth/session 으로 확인
  return false;
}

export function authHeaders(): Record<string, string> {
  // BFF 방식: Catch-all 프록시가 자동으로 Authorization 헤더 주입
  return {};
}
