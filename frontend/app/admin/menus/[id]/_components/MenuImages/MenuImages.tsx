"use client";

import { useState } from "react";
import Image from "next/image";
import { MenuImage } from "@/types";
import { ImageIcon } from "lucide-react";
import styles from "./MenuImages.module.css";

interface MenuImagesProps {
  images: MenuImage[];
  altText: string;
  description?: string;
}

export default function MenuImages({
  images,
  altText,
  description,
}: MenuImagesProps) {
  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const [selectedImage, setSelectedImage] = useState<MenuImage | undefined>(
    primaryImage,
  );

  if (!images || images.length === 0) {
    return (
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>
          <ImageIcon size={20} />
          이미지
        </h2>
        <div className={styles.emptyState}>
          <ImageIcon size={48} />
          <span>이미지가 없습니다</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>
        <ImageIcon size={20} />
        이미지
      </h2>

      <div className={styles.primaryImageWrapper}>
        {selectedImage && (
          <Image
            src={selectedImage.url}
            alt={description || `${altText} 메뉴 이미지`}
            fill
            className={styles.primaryImage}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        {selectedImage?.isPrimary && (
          <span className={styles.primaryBadge}>대표 이미지</span>
        )}
      </div>

      <div className={styles.thumbnailGrid}>
        {images.map((image) => (
          <button
            key={image.id}
            className={styles.thumbnailWrapper}
            onClick={() => setSelectedImage(image)}
            style={{
              borderColor:
                selectedImage?.id === image.id
                  ? "var(--color-primary-500)"
                  : undefined,
            }}
          >
            <Image
              src={image.url}
              alt={description || `${altText} 메뉴 이미지`}
              fill
              className={styles.thumbnailImage}
              sizes="100px"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
