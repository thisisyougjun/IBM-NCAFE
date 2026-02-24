"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { useTheme } from "@/app/_components/ThemeProvider";
import {
  Coffee,
  ArrowLeft,
  Sun,
  Moon,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ── 타입 정의 ───────────────────────────── */
interface MenuDetail {
  id: number;
  korName: string;
  engName: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  imageSrc: string | null;
  isAvailable: boolean;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuImage {
  id: number;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export default function MenuDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const menuId = params.id as string;

  const [menu, setMenu] = useState<MenuDetail | null>(null);
  const [images, setImages] = useState<MenuImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedMenus, setRelatedMenus] = useState<MenuDetail[]>([]);

  /* 데이터 fetch */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [menuRes, imageRes] = await Promise.all([
          fetch(`/api/menu/${menuId}`),
          fetch(`/api/menu/${menuId}/images`),
        ]);

        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setMenu(menuData);

          // 같은 카테고리의 다른 메뉴 fetch
          const relatedRes = await fetch(
            `/api/menu?categoryId=${menuData.categoryId}`,
          );
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedMenus(
              relatedData.menus
                .filter((m: MenuDetail) => m.id !== menuData.id)
                .slice(0, 4),
            );
          }
        }

        if (imageRes.ok) {
          const imageData = await imageRes.json();
          if (imageData.images) {
            setImages(imageData.images);
          }
        }
      } catch (err) {
        console.error("메뉴 상세 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [menuId]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/order" className={styles.backButton}>
              <ArrowLeft size={20} />
              <span>메뉴</span>
            </Link>
            <button className={styles.themeToggle} onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <div className={styles.loadingContainer}>
          <div className={styles.skeletonHero} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonText} />
          </div>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/order" className={styles.backButton}>
              <ArrowLeft size={20} />
              <span>메뉴</span>
            </Link>
          </div>
        </header>
        <div className={styles.emptyState}>
          <Coffee size={48} />
          <p>메뉴를 찾을 수 없습니다</p>
          <Link href="/order" className={styles.backLink}>
            메뉴 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── 헤더 ─────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/order" className={styles.backButton}>
            <ArrowLeft size={20} />
            <span>메뉴</span>
          </Link>
          <Link href="/order" className={styles.logo}>
            <Coffee size={22} />
            <span>NCAFE</span>
          </Link>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="테마 전환"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* ── 히어로 이미지 ────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          {images.length > 0 ? (
            <>
              <img
                src={
                  images[currentImageIndex].url.startsWith("http")
                    ? images[currentImageIndex].url
                    : `/images/${images[currentImageIndex].url}`
                }
                alt={menu.korName}
              />
              {images.length > 1 && (
                <>
                  <button
                    className={`${styles.imageNav} ${styles.imageNavPrev}`}
                    onClick={prevImage}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    className={`${styles.imageNav} ${styles.imageNavNext}`}
                    onClick={nextImage}
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className={styles.imageDots}>
                    {images.map((_, i) => (
                      <button
                        key={i}
                        className={`${styles.dot} ${
                          i === currentImageIndex ? styles.dotActive : ""
                        }`}
                        onClick={() => setCurrentImageIndex(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : menu.imageSrc ? (
            <img src={`/images/${menu.imageSrc}`} alt={menu.korName} />
          ) : (
            <div className={styles.heroPlaceholder}>
              <Coffee size={64} />
            </div>
          )}
        </div>
      </section>

      {/* ── 메뉴 정보 ──────────────────── */}
      <section className={styles.content}>
        <div className={styles.contentInner}>
          {/* 카테고리 & 상태 배지 */}
          <div className={styles.badges}>
            <span className={styles.categoryBadge}>{menu.categoryName}</span>
            {menu.isAvailable && (
              <span className={styles.availableBadge}>
                <Check size={12} /> 주문 가능
              </span>
            )}
            {menu.isSoldOut && (
              <span className={styles.soldOutBadge}>품절</span>
            )}
          </div>

          {/* 제목 */}
          <h1 className={styles.menuName}>{menu.korName}</h1>
          <p className={styles.menuEngName}>{menu.engName}</p>

          {/* 가격 */}
          <div className={styles.priceBox}>
            <span className={styles.price}>
              {menu.price.toLocaleString()}
              <small>원</small>
            </span>
          </div>

          {/* 구분선 */}
          <div className={styles.divider} />

          {/* 설명 */}
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionLabel}>메뉴 설명</h2>
            <p className={styles.description}>
              {menu.description || "이 메뉴에 대한 설명이 아직 없습니다."}
            </p>
          </div>

          {/* 메뉴 정보 테이블 */}
          <div className={styles.infoTable}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>카테고리</span>
              <span className={styles.infoValue}>{menu.categoryName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>판매 상태</span>
              <span className={styles.infoValue}>
                {menu.isSoldOut
                  ? "품절"
                  : menu.isAvailable
                    ? "판매 중"
                    : "미판매"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 관련 메뉴 ──────────────────── */}
      {relatedMenus.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.contentInner}>
            <h2 className={styles.relatedTitle}>같은 카테고리의 다른 메뉴</h2>
            <div className={styles.relatedGrid}>
              {relatedMenus.map((item) => (
                <Link
                  key={item.id}
                  href={`/order/${item.id}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImage}>
                    {item.imageSrc ? (
                      <img
                        src={`/images/${item.imageSrc}`}
                        alt={item.korName}
                      />
                    ) : (
                      <div className={styles.relatedPlaceholder}>
                        <Coffee size={24} />
                      </div>
                    )}
                  </div>
                  <div className={styles.relatedInfo}>
                    <h3>{item.korName}</h3>
                    <p>{item.price.toLocaleString()}원</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 푸터 ─────────────────────────── */}
      <footer className={styles.footer}>
        <p>© 2026 IBM NCAFE. All rights reserved.</p>
      </footer>
    </div>
  );
}
