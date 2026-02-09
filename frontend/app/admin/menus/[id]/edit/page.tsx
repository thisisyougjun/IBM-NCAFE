'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MenuForm from '../../_components/MenuForm';
import { getMenuById } from '@/mocks/menuData';
import { MenuFormData } from '@/types';
import styles from './page.module.css';

interface EditMenuPageProps {
    params: Promise<{ id: string }>;
}

export default function EditMenuPage({ params }: EditMenuPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [initialData, setInitialData] = useState<Partial<MenuFormData> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 실제로는 API 호출이 들어갈 곳
        const menu = getMenuById(id);

        if (menu) {
            // Menu 타입 -> MenuFormData 타입 변환
            setInitialData({
                korName: menu.korName,
                engName: menu.engName,
                description: menu.description,
                price: menu.price,
                categoryId: menu.category.id,
                images: menu.images,
                isAvailable: menu.isAvailable,
                isSoldOut: menu.isSoldOut,
                options: menu.options
            });
        }

        setIsLoading(false);
    }, [id]);

    const handleSubmit = async (data: MenuFormData) => {
        // TODO: 실제 API 수정 로직
        console.log('Modified menu data:', data);

        // 로딩 시늉
        await new Promise(resolve => setTimeout(resolve, 800));

        alert('메뉴가 수정되었습니다.');
        router.push(`/admin/menus/${id}`);
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
                submitLabel="수정사항 저장"
            />
        </main>
    );
}
