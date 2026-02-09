'use client';

import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import styles from './MenuDetailHeader.module.css';

interface MenuDetailHeaderProps {
    title: string;
    menuId: string;
    onDelete: () => void;
}

export default function MenuDetailHeader({ title, menuId, onDelete }: MenuDetailHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <Link href="/admin/menus" className={styles.backButton} aria-label="목록으로 돌아가기">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className={styles.title}>{title}</h1>
            </div>

            <div className={styles.actions}>
                <Link
                    href={`/admin/menus/${menuId}/edit`}
                    className={`${styles.actionButton} ${styles.editButton}`}
                >
                    <Edit2 size={16} />
                    수정
                </Link>
                <button
                    onClick={onDelete}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                >
                    <Trash2 size={16} />
                    삭제
                </button>
            </div>
        </header>
    );
}
