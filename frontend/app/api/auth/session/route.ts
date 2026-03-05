import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

/**
 * GET /api/auth/session
 * 현재 로그인한 사용자 정보 반환
 * 클라이언트에서 로그인 상태 확인 시 사용
 */
export async function GET() {
  const session = await getSession();

  if (!session.token) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: session.user });
}
