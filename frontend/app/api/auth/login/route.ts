import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8081';

/**
 * POST /api/auth/login
 * 일반 사용자 로그인
 * 1. Spring Boot 로그인 API 호출 (서버 간 통신)
 * 2. JWT를 암호화된 httpOnly 쿠키(iron-session)에 저장
 * 3. 클라이언트에는 user 정보만 반환 (JWT는 절대 반환 안 함)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!loginRes.ok) {
      const error = await loginRes.json().catch(() => ({ message: '로그인에 실패했습니다.' }));
      return NextResponse.json(error, { status: loginRes.status });
    }

    const data = await loginRes.json();
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

    // JWT는 반환하지 않음! user 정보만 반환
    return NextResponse.json({ user: session.user });
  } catch {
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
