import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8081';

/**
 * POST /api/auth/register
 * 일반 사용자 회원가입
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!registerRes.ok) {
      const error = await registerRes.json().catch(() => ({ message: '회원가입에 실패했습니다.' }));
      return NextResponse.json(error, { status: registerRes.status });
    }

    const data = await registerRes.json();
    const token: string = data.token;

    if (!token) {
      return NextResponse.json({ message: '토큰을 받지 못했습니다.' }, { status: 500 });
    }

    const session = await getSession();
    session.token = token;
    session.user = {
      username: data.username,
      email: data.email,
      name: data.name,
      role: 'USER',
    };
    await session.save();

    return NextResponse.json({ user: session.user });
  } catch {
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
