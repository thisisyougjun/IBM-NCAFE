'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxButtons?: number; // 화면에 보여질 최대 페이지 버튼 수 (기본 5)
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxButtons = 5,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    // 표시할 페이지 범위 계산
    const startPage = Math.max(
        1,
        Math.min(
            currentPage - Math.floor(maxButtons / 2),
            totalPages - maxButtons + 1
        )
    );
    const endPage = Math.min(startPage + maxButtons - 1, totalPages);

    // 실제 표시할 페이지 번호 배열 생성
    const pages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    return (
        <div className={styles.pagination}>
            {/* 첫 페이지로 */}
            <button
                className={styles.button}
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="First page"
            >
                <ChevronsLeft size={16} />
            </button>

            {/* 이전 페이지 */}
            <button
                className={styles.button}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <ChevronLeft size={16} />
            </button>

            {/* 페이지 번호 */}
            {pages.map((page) => (
                <button
                    key={page}
                    className={`${styles.button} ${page === currentPage ? styles.active : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            {/* 다음 페이지 */}
            <button
                className={styles.button}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <ChevronRight size={16} />
            </button>

            {/* 마지막 페이지로 */}
            <button
                className={styles.button}
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
            >
                <ChevronsRight size={16} />
            </button>
        </div>
    );
}
