import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8081';

/**
 * POST /api/auth/admin/login
 * 관리자 로그인
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const loginRes = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!loginRes.ok) {
      console.error(`[Admin Login Error] Spring Boot Status: ${loginRes.status}`);
      const error = await loginRes.json().catch(() => ({ message: '로그인에 실패했습니다.' }));
      console.error(`[Admin Login Error] Spring Boot Response:`, error);
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
      email: data.username,
      name: '관리자',
      role: 'ADMIN',
    };
    await session.save();

    return NextResponse.json({ user: session.user });
  } catch (err: any) {
    console.error(`[Admin Login Fatal Error]`, err);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
