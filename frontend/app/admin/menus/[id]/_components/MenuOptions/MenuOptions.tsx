import { MenuOption } from '@/types';
import { ListChecks } from 'lucide-react';
import styles from './MenuOptions.module.css';

interface MenuOptionsProps {
    options: MenuOption[];
}

export default function MenuOptions({ options }: MenuOptionsProps) {
    if (!options || options.length === 0) {
        return (
            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>
                    <ListChecks size={20} />
                    옵션
                </h2>
                <div className={styles.emptyState}>
                    등록된 옵션이 없습니다.
                </div>
            </section>
        );
    }

    return (
        <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
                <ListChecks size={20} />
                옵션 ({options.length})
            </h2>

            {options.map((option) => (
                <div key={option.id} className={styles.optionGroup}>
                    <div className={styles.optionGroupHeader}>
                        <span>{option.name}</span>
                        <div className={styles.badges}>
                            <span className={styles.optionType}>
                                {option.type === 'radio' ? '단일 선택' : '다중 선택'}
                            </span>
                            {option.required && (
                                <span className={`${styles.optionBadge} ${styles.requiredBadge}`}>필수</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.optionItems}>
                        {option.items.map((item) => (
                            <div key={item.id} className={styles.optionItem}>
                                <span>{item.name}</span>
                                <span className={styles.optionPrice}>
                                    {item.priceDelta > 0 ? `+${item.priceDelta.toLocaleString()}원` : '무료'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
