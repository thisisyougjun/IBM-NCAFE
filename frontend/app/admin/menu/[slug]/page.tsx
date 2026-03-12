"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import MenuForm from "@/app/admin/menus/_components/MenuForm";
import { MenuFormData } from "@/types";
import { menuToSlug } from "@/app/admin/_lib/menuSlug";
import styles from "./page.module.css";

type MenuItem = {
  id: number;
  korName: string;
  engName: string;
  description: string;
  price: number;
  categoryId: number;
  isAvailable: boolean;
  isSoldOut: boolean;
};

type OptionItem = {
  id: string;
  name: string;
  priceDelta: number;
};

type OptionGroup = {
  id: string;
  name: string;
  type: "radio" | "checkbox";
  required: boolean;
  items: OptionItem[];
};

interface MenuDetailBySlugPageProps {
  params: Promise<{ slug: string }>;
}

export default function MenuDetailBySlugPage({ params }: MenuDetailBySlugPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [menuId, setMenuId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [initialData, setInitialData] = useState<Partial<MenuFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [menusRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/menu", { signal: controller.signal }),
          fetch("/api/admin/categories", { signal: controller.signal }),
        ]);

        if (!menusRes.ok) throw new Error("메뉴 목록을 불러오지 못했습니다.");
        const menusData = await menusRes.json();
        const menus = Array.isArray(menusData?.menus) ? menusData.menus : [];
        const selected = menus.find((item: MenuItem) => menuToSlug(item) === slug);

        if (!selected) {
          setError("해당 slug 메뉴를 찾을 수 없습니다.");
          setInitialData(null);
          return;
        }

        setMenuId(selected.id);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }

        const [menuRes, optionsRes] = await Promise.all([
          fetch(`/api/admin/menu/${selected.id}`, { signal: controller.signal }),
          fetch(`/api/admin/menu/${selected.id}/options`, { signal: controller.signal }),
        ]);

        if (!menuRes.ok) throw new Error("메뉴 상세 정보를 불러오지 못했습니다.");

        const menu = await menuRes.json();
        const optionsPayload = optionsRes.ok ? await optionsRes.json() : { options: [] };
        const options = Array.isArray(optionsPayload?.options) ? optionsPayload.options : [];

        const mappedOptions: OptionGroup[] = options.map((option: any) => ({
          id: String(option.id ?? crypto.randomUUID()),
          name: String(option.name ?? ""),
          type: option.type === "checkbox" ? "checkbox" : "radio",
          required: Boolean(option.required),
          items: Array.isArray(option.items)
            ? option.items.map((item: any) => ({
                id: String(item.id ?? crypto.randomUUID()),
                name: String(item.name ?? ""),
                priceDelta: Number(item.priceDelta ?? 0),
              }))
            : [],
        }));

        setInitialData({
          korName: menu.korName ?? "",
          engName: menu.engName ?? "",
          description: menu.description ?? "",
          price: Number(menu.price ?? 0),
          categoryId: String(menu.categoryId ?? ""),
          isAvailable: menu.isAvailable ?? true,
          isSoldOut: menu.isSoldOut ?? false,
          options: mappedOptions,
        });
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "상세 정보를 불러오지 못했습니다.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadDetail();
    return () => controller.abort();
  }, [slug]);

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ id: cat.id, korName: cat.name, icon: "" })),
    [categories],
  );

  const handleSubmit = async (data: MenuFormData) => {
    if (!menuId) return;
    setIsSubmitting(true);
    try {
      const updateMenuRes = await fetch(`/api/admin/menu/${menuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          korName: data.korName,
          engName: data.engName,
          description: data.description,
          price: Number(data.price),
          categoryId: Number(data.categoryId),
          isAvailable: data.isAvailable,
          isSoldOut: data.isSoldOut,
        }),
      });

      if (!updateMenuRes.ok) {
        const msg = await updateMenuRes.text();
        throw new Error(msg || "메뉴 저장에 실패했습니다.");
      }

      const updateOptionsRes = await fetch(`/api/admin/menu/${menuId}/options`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          options: (data.options || []).map((option) => ({
            id: option.id,
            name: option.name,
            type: option.type,
            required: option.required,
            items: (option.items || []).map((item) => ({
              id: item.id,
              name: item.name,
              priceDelta: Number(item.priceDelta ?? 0),
            })),
          })),
        }),
      });

      if (!updateOptionsRes.ok) {
        const msg = await updateOptionsRes.text();
        throw new Error(msg || "옵션 저장에 실패했습니다.");
      }

      router.push("/admin/menus");
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className={styles.stateBox}>메뉴 정보를 불러오는 중입니다...</div>;

  if (!initialData || !menuId) {
    return (
      <div className={styles.stateBox}>
        <p>{error || "메뉴를 찾을 수 없습니다."}</p>
        <Link href="/admin/menus" className={styles.inlineLink}>
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin/menus" className={styles.backButton} aria-label="목록으로 돌아가기">
          <ArrowLeft size={20} />
        </Link>
        <h1 className={styles.title}>메뉴 상세 수정</h1>
      </header>
      <div id="options">
        <MenuForm
          defaultValues={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="저장 후 목록으로"
          categories={categoryOptions}
          showAdvancedSections
        />
      </div>
    </main>
  );
}

