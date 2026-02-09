'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import MenuForm from '../_components/MenuForm';
import { MenuFormData } from '@/types';
import styles from './page.module.css';

export default function NewMenuPage() {
    const router = useRouter();

    const handleSubmit = async (data: MenuFormData) => {
        // TODO: 실제 API 연동 필요
        console.log('New menu data:', data);

        // 임시 로딩 시늉 및 성공 처리
        await new Promise(resolve => setTimeout(resolve, 800));

        alert('메뉴가 성공적으로 등록되었습니다.');
        router.push('/admin/menus');
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
                submitLabel="메뉴 등록하기"
            />
        </main>
    );
}
