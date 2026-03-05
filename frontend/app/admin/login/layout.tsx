import { ReactNode } from "react";

// 로그인 페이지는 Admin 레이아웃(사이드바, 헤더) 없이 독립 렌더링
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
