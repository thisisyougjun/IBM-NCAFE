'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { MenuFormData } from '@/types';
import { Plus } from 'lucide-react';
import OptionGroupItem from './OptionGroupItem';
import styles from './OptionSection.module.css';

export default function OptionSection() {
    const { control } = useFormContext<MenuFormData>();

    // 옵션 그룹 관리
    const { fields, append, remove } = useFieldArray({
        control,
        name: "options"
    });

    return (
        <div className={styles.container}>
            {fields.length === 0 ? (
                <div className={styles.emptyState}>
                    등록된 옵션이 없습니다.<br />
                    사이즈, 샷 추가 등 옵션을 추가해보세요.
                </div>
            ) : (
                fields.map((field, index) => (
                    <OptionGroupItem
                        key={field.id}
                        index={index}
                        onRemove={() => remove(index)}
                    />
                ))
            )}

            <button
                type="button"
                className={styles.addButton}
                onClick={() => append({
                    id: crypto.randomUUID(),
                    name: '',
                    type: 'radio',
                    required: true,
                    items: [
                        { id: crypto.randomUUID(), name: '기본', priceDelta: 0 }
                    ]
                })}
            >
                <Plus size={16} />
                옵션 그룹 추가
            </button>
        </div>
    );
}
