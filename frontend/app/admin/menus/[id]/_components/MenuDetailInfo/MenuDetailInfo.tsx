import { Menu } from '@/types';
import { Info } from 'lucide-react';
import styles from './MenuDetailInfo.module.css';
import { format } from 'date-fns';

interface MenuDetailInfoProps {
    menu: Menu;
}

export default function MenuDetailInfo({ menu }: MenuDetailInfoProps) {
    return (
        <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
                <Info size={20} />
                기본 정보
            </h2>

            <div className={styles.row}>
                <span className={styles.label}>영문명</span>
                <span className={styles.value}>{menu.engName}</span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>카테고리</span>
                <span className={styles.value}>
                    {menu.category.icon} {menu.category.korName}
                </span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>가격</span>
                <span className={styles.value}>{menu.price.toLocaleString()}원</span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>판매 상태</span>
                <span className={`${styles.badge} ${menu.isSoldOut ? styles.badgeSoldOut : styles.badgeAvailable}`}>
                    {menu.isSoldOut ? '품절' : '판매중'}
                </span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>등록일</span>
                <span className={styles.value}>{format(menu.createdAt, 'yyyy.MM.dd')}</span>
            </div>

            <div className={styles.descriptionWrapper}>
                <span className={styles.descriptionLabel}>설명</span>
                <p className={styles.description}>{menu.description}</p>
            </div>
        </section>
    );
}
