import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8081';

/**
 * Catch-all API 프록시 (BFF 패턴의 핵심)
 *
 * 클라이언트의 모든 /api/* 요청을 받아서:
 * 1. 세션 쿠키에서 JWT 복호화
 * 2. Authorization 헤더에 JWT 주입
 * 3. Spring Boot로 요청 전달
 * 4. 응답 그대로 클라이언트에 전달
 *
 * 클라이언트는 JWT를 전혀 알 필요가 없다.
 *
 * 단, /api/auth/* 경로는 별도 route.ts가 처리하므로 여기 오지 않는다.
 */
async function proxyRequest(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  let path = req.nextUrl.pathname;   // 예: /api/menu
  if (path.startsWith("/api")) {
    path = path.slice(4); // "/api" 제거 -> "/menu"
  }
  const search = req.nextUrl.search;   // 예: ?page=0&size=10
  const targetUrl = `${API_BASE}${path}${search}`;

  // 요청 헤더 구성
  const headers: Record<string, string> = {};

  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  const accept = req.headers.get('accept');
  if (accept) headers['Accept'] = accept;

  // ★ 핵심: 세션에서 JWT를 꺼내 Authorization 헤더로 주입
  if (session.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  // 요청 바디 전달
  let body: BodyInit | null = null;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (contentType?.includes('multipart/form-data')) {
      // 파일 업로드: Content-Type은 fetch가 자동 설정하도록 헤더 제거
      delete headers['Content-Type'];
      body = await req.blob();
    } else {
      body = await req.text();
    }
  }

  try {
    const proxyRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Spring Boot가 401 반환 → 세션 만료 처리
    if (proxyRes.status === 401 && session.token) {
      session.destroy();
    }

    // 응답 헤더 구성
    const responseHeaders = new Headers();
    const resContentType = proxyRes.headers.get('content-type');
    if (resContentType) responseHeaders.set('Content-Type', resContentType);

    return new NextResponse(proxyRes.body, {
      status: proxyRes.status,
      statusText: proxyRes.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { message: 'API 서버에 연결할 수 없습니다.' },
      { status: 503 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
