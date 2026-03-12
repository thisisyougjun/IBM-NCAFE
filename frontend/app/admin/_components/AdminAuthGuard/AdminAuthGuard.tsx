"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authAPI } from "@/app/lib/api";

interface AdminAuthGuardProps {
  children: ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const { user } = await authAPI.getSession();

        if (cancelled) return;

        if (!user) {
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname || "/admin")}`);
          return;
        }

        if (user.role !== "ADMIN") {
          alert("접근 권한이 없습니다.");
          window.location.href = "/order";
          return;
        }

        setReady(true);
      } catch (e: any) {
        if (cancelled) return;
        // 세션 확인 실패 시에는 안전하게 로그인으로 보냄
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname || "/admin")}`);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}

