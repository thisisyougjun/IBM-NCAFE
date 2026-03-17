import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

/**
 * GET /api/auth/session
 * 현재 로그인한 사용자 정보 반환
 * 클라이언트에서 로그인 상태 확인 시 사용
 */
export async function GET() {
  const session = await getSession();

  // user 정보와 access token이 모두 있어야 유효 세션으로 간주
  // (token 없이 user만 남아 있으면 /api/admin/* 호출 시 403이 발생할 수 있음)
  if (!session.user || !session.token) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: session.user });
}
