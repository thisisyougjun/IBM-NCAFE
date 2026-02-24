"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useTheme } from "@/app/_components/ThemeProvider";
import {
  Coffee,
  IceCreamCone,
  Cake,
  CupSoda,
  Leaf,
  Search,
  Sun,
  Moon,
} from "lucide-react";

/* ── 타입 정의 ───────────────────────────── */
interface MenuItem {
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
}

interface Category {
  id: number;
  name: string;
}

/* ── 카테고리 아이콘 매핑 ──────────────────── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  커피: <Coffee size={18} />,
  논커피: <CupSoda size={18} />,
  디저트: <Cake size={18} />,
  "스무디/주스": <IceCreamCone size={18} />,
  티: <Leaf size={18} />,
};

export default function OrderPage() {
  const { theme, toggleTheme } = useTheme();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /* 카테고리 & 메뉴 데이터 fetch */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [menuRes, catRes] = await Promise.all([
          fetch("/api/menu"),
          fetch("/api/admin/categories"),
        ]);

        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setMenus(menuData.menus);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /* 필터링 */
  const filteredMenus = menus.filter((m) => {
    const matchesCategory =
      selectedCategory === null || m.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      m.korName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.engName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && m.isAvailable;
  });

  /* 카테고리별 그룹핑 */
  const groupedMenus = selectedCategory
    ? {
        [categories.find((c) => c.id === selectedCategory)?.name || ""]:
          filteredMenus,
      }
    : filteredMenus.reduce<Record<string, MenuItem[]>>((acc, menu) => {
        const catName = menu.categoryName || "기타";
        if (!acc[catName]) acc[catName] = [];
        acc[catName].push(menu);
        return acc;
      }, {});

  return (
    <div className={styles.page}>
      {/* ── 헤더 ─────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/order" className={styles.logo}>
            <Coffee size={28} />
            <span>NCAFE</span>
          </Link>
          <div className={styles.headerRight}>
            <p className={styles.headerTagline}>
              신선한 원두로 내리는 한 잔의 여유
            </p>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"
              }
            >
              <span className={styles.themeToggleTrack}>
                <Sun size={14} className={styles.sunIcon} />
                <Moon size={14} className={styles.moonIcon} />
                <span
                  className={`${styles.themeToggleThumb} ${
                    theme === "dark" ? styles.themeToggleThumbDark : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 검색 & 카테고리 ─────────────── */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="메뉴 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.categoryBar}>
          <button
            className={`${styles.categoryChip} ${
              selectedCategory === null ? styles.categoryActive : ""
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryChip} ${
                selectedCategory === cat.id ? styles.categoryActive : ""
              }`}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
            >
              {CATEGORY_ICONS[cat.name] || <Coffee size={18} />}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 메뉴 리스트 ─────────────────── */}
      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className={styles.emptyState}>
            <Coffee size={48} />
            <p>메뉴가 없습니다</p>
          </div>
        ) : (
          Object.entries(groupedMenus).map(([catName, items]) => (
            <section key={catName} className={styles.menuSection}>
              <h2 className={styles.sectionTitle}>
                {CATEGORY_ICONS[catName]}
                {catName}
                <span className={styles.sectionCount}>{items.length}</span>
              </h2>
              <div className={styles.menuGrid}>
                {items.map((menu) => (
                  <MenuCard key={menu.id} menu={menu} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* ── 푸터 ─────────────────────────── */}
      <footer className={styles.footer}>
        <p>© 2026 IBM NCAFE. All rights reserved.</p>
      </footer>
    </div>
  );
}

/* ── 메뉴 카드 컴포넌트 ──────────────────── */
function MenuCard({ menu }: { menu: MenuItem }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/order/${menu.id}`} className={styles.cardLink}>
      <article
        className={`${styles.card} ${menu.isSoldOut ? styles.cardSoldOut : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.cardImage}>
          {menu.imageSrc ? (
            <img src={`/images/${menu.imageSrc}`} alt={menu.korName} />
          ) : (
            <div className={styles.cardPlaceholder}>
              <Coffee size={32} />
            </div>
          )}
          {menu.isSoldOut && (
            <div className={styles.soldOutOverlay}>
              <span>SOLD OUT</span>
            </div>
          )}
          <div
            className={`${styles.cardOverlay} ${
              isHovered ? styles.cardOverlayVisible : ""
            }`}
          >
            <p className={styles.cardDesc}>{menu.description}</p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.cardCategory}>{menu.categoryName}</div>
          <h3 className={styles.cardName}>{menu.korName}</h3>
          <p className={styles.cardEngName}>{menu.engName}</p>
          <div className={styles.cardFooter}>
            <span className={styles.cardPrice}>
              {menu.price.toLocaleString()}
              <small>원</small>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
