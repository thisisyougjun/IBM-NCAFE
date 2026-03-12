'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MenuForm from '../../_components/MenuForm';
import { MenuFormData } from '@/types';
import styles from './page.module.css';

interface EditMenuPageProps {
    params: Promise<{ id: string }>;
}

export default function EditMenuPage({ params }: EditMenuPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [initialData, setInitialData] = useState<Partial<MenuFormData> | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [menuRes, catRes] = await Promise.all([
            fetch(`/api/admin/menu/${id}`),
            fetch(`/api/admin/categories`),
          ]);

          if (catRes.ok) {
            const cats = await catRes.json();
            setCategories(Array.isArray(cats) ? cats : []);
          }

          if (!menuRes.ok) {
            setInitialData(null);
            return;
          }
          const m = await menuRes.json();

          setInitialData({
            korName: m.korName,
            engName: m.engName,
            description: m.description,
            price: m.price,
            categoryId: m.categoryId,
            isAvailable: m.isAvailable ?? true,
            isSoldOut: m.isSoldOut ?? false,
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [id]);

    const handleSubmit = async (data: MenuFormData) => {
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/admin/menu/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            korName: data.korName,
            engName: data.engName,
            description: data.description,
            price: data.price,
            categoryId: Number(data.categoryId),
            isAvailable: data.isAvailable,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: "메뉴 수정에 실패했습니다." }));
          alert(err.message || "메뉴 수정에 실패했습니다.");
          return;
        }

        alert("메뉴가 수정되었습니다.");
        router.push(`/admin/menus/${id}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">메뉴 정보를 불러오는 중입니다...</div>;
    }

    if (!initialData) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">메뉴를 찾을 수 없습니다</h2>
                <Link
                    href="/admin/menus"
                    className="text-blue-500 hover:underline"
                >
                    목록으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <Link href={`/admin/menus/${id}`} className={styles.backButton} aria-label="상세 페이지로 돌아가기">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className={styles.title}>메뉴 수정</h1>
            </header>

            <MenuForm
                defaultValues={initialData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel="수정사항 저장"
                categories={categories.map((c) => ({ id: c.id, korName: c.name, icon: "" }))}
                showAdvancedSections={false}
            />
        </main>
    );
}
