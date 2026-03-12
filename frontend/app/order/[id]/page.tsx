"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { useCart } from "@/app/_components/CartProvider";
import { fetchPublic, resolvePublicImageSrc } from "@/app/lib/publicFetch";
import {
  Coffee,
  ArrowLeft,
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
  const { addToCart } = useCart();
  const menuId = params.id as string;

  const [menu, setMenu] = useState<MenuDetail | null>(null);
  const [images, setImages] = useState<MenuImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedMenus, setRelatedMenus] = useState<MenuDetail[]>([]);
  const [qty, setQty] = useState(1);

  // 1차(프론트) 옵션 세트: 백엔드 옵션 API가 없어서 카테고리별 기본 옵션만 제공
  const [temperature, setTemperature] = useState<"HOT" | "ICE">("ICE");
  const [size, setSize] = useState<"S" | "M" | "L">("M");
  const [extraShot, setExtraShot] = useState<0 | 1 | 2>(0);

  /* 데이터 fetch */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [menuRes, imageRes] = await Promise.all([
          fetchPublic(`/menu/${menuId}`),
          fetchPublic(`/menu/${menuId}/images`),
        ]);

        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setMenu(menuData);

          // 같은 카테고리의 다른 메뉴 fetch
          const relatedRes = await fetchPublic(
            `/menu?categoryId=${menuData.categoryId}`,
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

  const basePrice = menu.price ?? 0;
  const sizeDelta = size === "S" ? 0 : size === "M" ? 500 : 1000;
  const shotDelta = extraShot * 500;
  const optionsDelta = sizeDelta + shotDelta;
  const unitPrice = basePrice + optionsDelta;
  const totalPrice = unitPrice * qty;

  const canOrder = menu.isAvailable && !menu.isSoldOut;

  const selectedOptions = [
    { name: "온도", value: temperature, priceDelta: 0 },
    { name: "사이즈", value: size, priceDelta: sizeDelta },
    ...(extraShot > 0
      ? [{ name: "샷추가", value: `+${extraShot}`, priceDelta: shotDelta }]
      : []),
  ];

  function addSelectionToCart(quantity: number) {
    const m = menu;
    if (!m) return;
    if (!canOrder) return;

    for (let i = 0; i < quantity; i += 1) {
      addToCart({
        menuId: m.id,
        korName: m.korName,
        engName: m.engName,
        price: basePrice,
        imageSrc: m.imageSrc,
        categoryName: m.categoryName,
        options: selectedOptions,
      });
    }
  }

  function handleAddToCart() {
    if (!canOrder) return;
    addSelectionToCart(qty);
    alert("장바구니에 담겼습니다.");
  }

  return (
    <div className={`${styles.page} fade-in`}>
      {/* ── 헤더 ─────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/order" className={styles.backButton}>
            <ArrowLeft size={16} />
            <span>BACK TO MENU</span>
          </Link>
          <Link href="/order" className={styles.logo}>
            <span>NCAFE</span>
          </Link>
        </div>
      </header>

      <main className={styles.detailGrid}>
        <aside className={styles.sidebarColumn}>
          <div className={styles.badges}>
            <span className={styles.categoryBadge}>{menu.categoryName}</span>
          </div>
          <h1 className={styles.menuName}>{menu.korName}</h1>
          <p className={styles.menuEngName}>{menu.engName}</p>

          <div className={styles.optionSection}>
            <span className={styles.sectionLabel}>CUSTOMIZE</span>

            <div className={styles.optionGrid}>
              <div className={styles.optionBlock}>
                <div className={styles.optionTitle}>TEMPERATURE</div>
                <div className={styles.pills}>
                  <button
                    type="button"
                    className={`${styles.pill} ${temperature === "HOT" ? styles.pillActive : ""}`}
                    onClick={() => setTemperature("HOT")}
                  >
                    HOT
                  </button>
                  <button
                    type="button"
                    className={`${styles.pill} ${temperature === "ICE" ? styles.pillActive : ""}`}
                    onClick={() => setTemperature("ICE")}
                  >
                    ICE
                  </button>
                </div>
              </div>

              <div className={styles.optionBlock}>
                <div className={styles.optionTitle}>SIZE</div>
                <div className={styles.pills}>
                  <button
                    type="button"
                    className={`${styles.pill} ${size === "S" ? styles.pillActive : ""}`}
                    onClick={() => setSize("S")}
                  >
                    S
                  </button>
                  <button
                    type="button"
                    className={`${styles.pill} ${size === "M" ? styles.pillActive : ""}`}
                    onClick={() => setSize("M")}
                  >
                    M (+500)
                  </button>
                  <button
                    type="button"
                    className={`${styles.pill} ${size === "L" ? styles.pillActive : ""}`}
                    onClick={() => setSize("L")}
                  >
                    L (+1,000)
                  </button>
                </div>
              </div>

              <div className={styles.optionBlock}>
                <div className={styles.optionTitle}>EXTRA SHOT</div>
                <div className={styles.pills}>
                  {[0, 1, 2].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`${styles.pill} ${extraShot === n ? styles.pillActive : ""}`}
                      onClick={() => setExtraShot(n as 0 | 1 | 2)}
                    >
                      {n === 0 ? "NONE" : `+${n} (+${(n * 500).toLocaleString()})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.qtyRow}>
            <span className={styles.sectionLabel}>QUANTITY</span>
            <div className={styles.qtyControl}>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className={styles.qtyValue}>{qty}</span>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setQty((q) => Math.min(99, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.ctaPanel}>
            <div className={styles.priceSummary}>
              <span>TOTAL PRICE</span>
              <strong>{totalPrice.toLocaleString()} KRW</strong>
            </div>
            <div className={styles.ctaButtons}>
              <button
                type="button"
                className={`${styles.addBtn} ${!canOrder ? styles.addBtnDisabled : ""}`}
                onClick={handleAddToCart}
                disabled={!canOrder}
              >
                {menu.isSoldOut ? "SOLD OUT" : "ADD TO CART"}
              </button>
              <button
                type="button"
                className={`${styles.payNowBtn} ${!canOrder ? styles.addBtnDisabled : ""}`}
                onClick={() => {
                  addSelectionToCart(qty);
                  if (canOrder) router.push("/checkout");
                }}
                disabled={!canOrder}
              >
                BUY NOW
              </button>
            </div>
          </div>
        </aside>

        <section className={styles.mainColumn}>
          <div className={styles.heroImage}>
            {images.length > 0 ? (
              <>
                <img
                  src={resolvePublicImageSrc(images[currentImageIndex].url) || ""}
                  alt={menu.korName}
                />
                {images.length > 1 && (
                  <>
                    <button
                      className={`${styles.imageNav} ${styles.imageNavPrev}`}
                      onClick={prevImage}
                    >
                      PREV
                    </button>
                    <button
                      className={`${styles.imageNav} ${styles.imageNavNext}`}
                      onClick={nextImage}
                    >
                      NEXT
                    </button>
                  </>
                )}
              </>
            ) : menu.imageSrc ? (
              <img src={resolvePublicImageSrc(menu.imageSrc) || ""} alt={menu.korName} />
            ) : (
              <div className={styles.heroPlaceholder}>
                <span>NO IMAGE</span>
              </div>
            )}
          </div>

          <div className={styles.descriptionSection}>
            <span className={styles.sectionLabel}>DESCRIPTION</span>
            <p className={styles.description}>
              {menu.description || "NO DESCRIPTION AVAILABLE."}
            </p>
          </div>
        </section>
      </main>

      {/* ── 관련 메뉴 ──────────────────── */}
      {relatedMenus.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.contentInner}>
            <h2 className={styles.relatedTitle}>YOU MAY ALSO LIKE</h2>
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
                        src={resolvePublicImageSrc(item.imageSrc) || ""}
                        alt={item.korName}
                      />
                    ) : (
                      <div className={styles.relatedPlaceholder}>
                        <span>NO IMAGE</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.relatedInfo}>
                    <h3>{item.korName}</h3>
                    <p>{(item.price ?? 0).toLocaleString()} KRW</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 푸터 ─────────────────────────── */}
      <footer className={styles.footer}>
        <p>© 2026 NCAFE. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
