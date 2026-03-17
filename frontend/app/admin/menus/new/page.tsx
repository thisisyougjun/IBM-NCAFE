'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import MenuForm from '../_components/MenuForm';
import { MenuFormData } from '@/types';
import styles from './page.module.css';

export default function NewMenuPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<{ id: number; korName: string; icon: string }[]>([]);

    useEffect(() => {
        let cancelled = false;

        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/admin/categories");
                if (!response.ok) return;

                const data = await response.json();
                if (cancelled || !Array.isArray(data)) return;

                setCategories(
                    data.map((cat: any) => ({
                        id: Number(cat.id),
                        korName: String(cat.name ?? ""),
                        icon: "",
                    }))
                );
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleSubmit = async (data: MenuFormData) => {
        setIsSubmitting(true);
        try {
            const createMenuRes = await fetch("/api/admin/menu", {
                method: "POST",
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

            if (!createMenuRes.ok) {
                const err = await createMenuRes.json().catch(() => ({ message: "메뉴 등록에 실패했습니다." }));
                throw new Error(err.message || "메뉴 등록에 실패했습니다.");
            }

            const created = await createMenuRes.json();
            const createdId = Number(created?.id);

            // 옵션이 있으면 신규 메뉴에 바로 저장
            if (createdId && Array.isArray(data.options) && data.options.length > 0) {
                const updateOptionsRes = await fetch(`/api/admin/menu/${createdId}/options`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        options: data.options.map((option) => ({
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
                    const err = await updateOptionsRes.json().catch(() => ({ message: "옵션 저장에 실패했습니다." }));
                    throw new Error(err.message || "옵션 저장에 실패했습니다.");
                }
            }

            alert('메뉴가 성공적으로 등록되었습니다.');
            router.push('/admin/menus');
        } catch (error: any) {
            alert(error?.message || "메뉴 등록 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <Link href="/admin/menus" className={styles.backButton} aria-label="목록으로 돌아가기">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className={styles.title}>새 메뉴 등록</h1>
            </header>

            <MenuForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel="메뉴 등록하기"
                categories={categories}
                showAdvancedSections
            />
        </main>
    );
}
