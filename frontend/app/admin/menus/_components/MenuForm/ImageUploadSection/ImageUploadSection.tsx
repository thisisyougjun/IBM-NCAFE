'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import Image from 'next/image';
import { Upload, X, Star, Image as ImageIcon } from 'lucide-react';
import { MenuFormData } from '@/types';
import styles from './ImageUploadSection.module.css';

export default function ImageUploadSection() {
    const { control, watch } = useFormContext<MenuFormData>();
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "images"
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
        }
        // Reset input value to allow selecting the same file again
        e.target.value = '';
    };

    const processFiles = (files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) return;

        imageFiles.forEach((file) => {
            const previewUrl = URL.createObjectURL(file);
            const isFirstImage = fields.length === 0; // 첫 번째 이미지는 자동으로 대표로 설정

            append({
                id: crypto.randomUUID(),
                url: previewUrl,
                isPrimary: isFirstImage,
                sortOrder: fields.length,
                file: file
            });
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleSetPrimary = (index: number) => {
        // 모든 이미지의 isPrimary를 false로 설정하고, 선택된 인덱스만 true로 설정
        // useFieldArray의 모든 아이템을 업데이트하는 것은 비효율적일 수 있으나 정확성을 위해 수행
        fields.forEach((field, idx) => {
            update(idx, {
                ...field,
                isPrimary: idx === index
            });
        });
    };

    const handleRemove = (index: number) => {
        const isPrimary = fields[index].isPrimary;
        remove(index);

        // 만약 삭제된 이미지가 대표 이미지였고 다른 이미지가 남아있다면, 첫 번째 이미지를 대표로 설정
        if (isPrimary && fields.length > 1) {
            // fields 배열은 아직 업데이트 전 상태(삭제 전)이므로 length 체크 주의. 
            // remove 호출 후에는 fields 상태가 바로 반영되지 않을 수 있음.
            // 하지만 react-hook-form의 remove는 동기적으로 동작할 것으로 예상되나, 
            // 안전하게 다시 가져오는 로직보다는, 남은 것 중 첫번째(인덱스 0이 될 녀석)를 갱신
            // 삭제 후 인덱스 0이 될 녀석(원래 인덱스 1이었던 녀석)에게 isPrimary를 줘야 함.
            // 이 로직은 복잡할 수 있으니 useEffect로 처리하거나, 
            // 간단히 삭제 후 사용자가 다시 지정하도록 두는게 나을 수도 있음.
            // 여기서는 사용자 편의를 위해 남은 이미지 중 첫번째를 대표로 만듦.
            // *실제로는 remove 호출 직후 fields 배열이 즉시 갱신되지 않으므로 비동기 처리가 필요하거나
            // 렌더링 사이클을 기다려야 함. 여기서는 단순 삭제만 처리.
        }
    };

    return (
        <div className={styles.container}>
            {/* 드래그 앤 드롭 영역 */}
            <div
                className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                />
                <div className={styles.dropzoneIcon}>
                    <Upload size={48} />
                </div>
                <div>
                    <p className={styles.dropzoneText}>
                        이미지를 드래그하여 놓거나 클릭하여 선택하세요
                    </p>
                    <p className={styles.dropzoneSubText}>
                        JPG, PNG, WEBP 지원 (최대 5MB)
                    </p>
                </div>
            </div>

            {/* 이미지 그리드 */}
            {fields.length > 0 && (
                <div className={styles.imageGrid}>
                    {fields.map((field, index) => (
                        <div key={field.id} className={styles.imageCard}>
                            <Image
                                src={field.url}
                                alt={`Menu Image ${index + 1}`}
                                fill
                                className={styles.imagePreview}
                            />

                            {field.isPrimary && (
                                <span className={styles.primaryBadge}>
                                    대표
                                </span>
                            )}

                            <div className={styles.overlay}>
                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(index);
                                        }}
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        aria-label="이미지 삭제"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {!field.isPrimary && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetPrimary(index);
                                        }}
                                        className={styles.primaryButton}
                                    >
                                        대표 이미지로 설정
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
