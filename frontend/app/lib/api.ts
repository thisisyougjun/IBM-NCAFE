// ─────────────────────────────────────────────────────────────
// 클라이언트 컴포넌트에서 사용하는 API 유틸리티
// JWT를 직접 다루지 않고 BFF 프록시를 통해 API를 호출한다.
// ─────────────────────────────────────────────────────────────

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers,
      },
      // same-origin이 기본값이므로 쿠키(ncafe_session)는 자동으로 전송된다
    });

    if (!res.ok) {
      // 인증 만료 → 로그인 페이지로 (단, 인증 관련 API 호출 시에는 브라우저 리다이렉트 방지)
      if (res.status === 401 && typeof window !== 'undefined' && !endpoint.startsWith('/auth/')) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
           window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
           return;
        }
      }
      const error: any = new Error(`API Error: ${res.status}`);
      error.status = res.status;
      try {
        const body = await res.json();
        error.message = body.message || error.message;
        error.details = body;
      } catch { /* body 없음 */ }
      console.error(`[fetchAPI Error] Endpoint: ${endpoint}, Status: ${res.status}, Details:`, error.details || 'None');
      throw error;
    }

    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return res.json();
    }
    return null;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError: any = new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      networkError.status = 0;
      console.error(`[fetchAPI Network Error] Endpoint: ${endpoint}, Error:`, error);
      throw networkError;
    }
    console.error(`[fetchAPI Unknown Error] Endpoint: ${endpoint}, Error:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// 인증 관련 API
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  /** 일반 사용자 로그인 */
  login: (username: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  /** 관리자 로그인 */
  adminLogin: (username: string, password: string) =>
    fetchAPI('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  /** 회원가입 */
  register: (name: string, username: string, email: string, password: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password }),
    }),

  /** 로그아웃 */
  logout: () => fetchAPI('/auth/logout', { method: 'POST' }),

  /** 현재 세션 사용자 조회 */
  getSession: () => fetchAPI('/auth/session'),
};
