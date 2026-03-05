import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

// ─────────────────────────────────────────────────────────────
// 세션에 저장되는 사용자 정보 타입
// ─────────────────────────────────────────────────────────────
export interface SessionUser {
  username?: string; // 일반 사용자: username / 관리자: adminUsername
  email?: string;    // 일반 사용자: email
  name: string;      // 일반 사용자: 이름  / 관리자: "관리자"
  role: 'ADMIN' | 'USER';
}

export interface SessionData {
  token: string;        // Spring Boot Access Token (브라우저에 절대 전달하지 않음)
  user: SessionUser;
}

export const sessionOptions: SessionOptions = {
  // 운영환경에서는 SESSION_SECRET 환경변수 필수 (32자 이상 랜덤 문자열)
  password: process.env.SESSION_SECRET || 'ncafe-session-secret-change-in-production-must-be-32-chars',
  cookieName: 'ncafe_session',
  cookieOptions: {
    httpOnly: true,                                     // JS 접근 차단 (XSS 방어)
    secure: process.env.NODE_ENV === 'production',      // 운영환경에서만 HTTPS 필수
    sameSite: 'lax' as const,                           // CSRF 기본 방어
    path: '/',
    maxAge: 60 * 60 * 24,                               // 24시간 (Access Token보다 길게)
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
