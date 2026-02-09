'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { MenuFormData } from '@/types';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import styles from './OptionSection.module.css';

interface OptionGroupItemProps {
    index: number;
    onRemove: () => void;
}

export default function OptionGroupItem({ index, onRemove }: OptionGroupItemProps) {
    const { register, control, formState: { errors } } = useFormContext<MenuFormData>();

    // 옵션 내 아이템 관리
    const { fields, append, remove } = useFieldArray({
        control,
        name: `options.${index}.items`
    });

    return (
        <div className={styles.groupCard}>
            <div className={styles.groupHeader}>
                <div className={styles.dragHandle}>
                    <GripVertical size={20} />
                </div>

                <div className={styles.groupInputs}>
                    <div className={styles.mainInputs}>
                        <div style={{ flex: 2 }}>
                            <input
                                {...register(`options.${index}.name` as const, { required: '옵션명을 입력해주세요' })}
                                placeholder="옵션명 (예: 사이즈, 샷 추가)"
                                className={styles.optionNameInput}
                            />
                            {errors.options?.[index]?.name && (
                                <span className={styles.errorText}>{errors.options[index]?.name?.message}</span>
                            )}
                        </div>

                        <div style={{ flex: 1 }}>
                            <select
                                {...register(`options.${index}.type` as const)}
                                className={styles.typeSelect}
                            >
                                <option value="radio">단일 선택 (Radio)</option>
                                <option value="checkbox">다중 선택 (Checkbox)</option>
                            </select>
                        </div>
                    </div>

                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            {...register(`options.${index}.required` as const)}
                        />
                        필수 선택
                    </label>
                </div>

                <button type="button" onClick={onRemove} className={styles.deleteButton} aria-label="옵션 그룹 삭제">
                    <Trash2 size={18} />
                </button>
            </div>

            <div className={styles.itemsSection}>
                <span className={styles.itemsLabel}>선택 항목</span>

                <div className={styles.itemList}>
                    {fields.map((item, itemIndex) => (
                        <div key={item.id} className={styles.itemRow}>
                            <input
                                {...register(`options.${index}.items.${itemIndex}.name` as const, { required: true })}
                                placeholder="항목명 (예: Regular)"
                                className={styles.itemNameInput}
                            />
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    {...register(`options.${index}.items.${itemIndex}.priceDelta` as const, { valueAsNumber: true })}
                                    placeholder="추가 금액"
                                    className={styles.itemPriceInput}
                                />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '12px' }}>원</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(itemIndex)}
                                className={styles.deleteButton}
                                tabIndex={-1}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => append({ id: crypto.randomUUID(), name: '', priceDelta: 0 })}
                    className={styles.addItemButton}
                >
                    <Plus size={14} />
                    항목 추가
                </button>
            </div>
        </div>
    );
}
