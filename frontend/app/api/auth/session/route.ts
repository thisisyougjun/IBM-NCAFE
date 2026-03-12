import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

/**
 * GET /api/auth/session
 * 현재 로그인한 사용자 정보 반환
 * 클라이언트에서 로그인 상태 확인 시 사용
 */
export async function GET() {
  const session = await getSession();

  // Admin UI 접근 제어는 토큰이 아니라 user.role 기반으로 동작해야 하므로,
  // session.user가 있으면 user를 반환한다. (토큰은 BFF 프록시 호출에서만 필요)
  if (!session.user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: session.user });
}
