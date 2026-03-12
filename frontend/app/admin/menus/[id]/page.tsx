"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { menuToSlug } from "@/app/admin/_lib/menuSlug";

interface LegacyMenuDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LegacyMenuDetailPage({ params }: LegacyMenuDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const redirectToSlug = async () => {
      const res = await fetch(`/api/admin/menu/${id}`);
      if (!res.ok) {
        router.replace("/admin/menus");
        return;
      }

      const menu = await res.json();
      if (cancelled) return;
      router.replace(`/admin/menu/${menuToSlug(menu)}`);
    };

    redirectToSlug();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  return <div className="p-8 text-center text-gray-500">상세 페이지로 이동 중입니다...</div>;
}

