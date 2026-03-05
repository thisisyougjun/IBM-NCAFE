import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

/**
 * POST /api/auth/logout
 * 로그아웃 - 세션 쿠키 즉시 삭제
 */
export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
