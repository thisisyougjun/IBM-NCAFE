"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { getCartItemOptionsKey, useCart } from "@/app/_components/CartProvider";
import { authAPI } from "@/app/lib/api";
import { fetchPublic, resolvePublicImageSrc } from "@/app/lib/publicFetch";
import {
  Coffee,
  IceCreamCone,
  Cake,
  CupSoda,
  Leaf,
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  ShoppingCart,
  Plus,
  Minus,
  X,
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
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems } = useCart();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // BFF 세션 기반 로그인 상태 확인
  useEffect(() => {
    authAPI.getSession().then((data) => {
      setUserName(data?.user?.name || null);
    }).catch(() => setUserName(null));

    const onLogin = () => authAPI.getSession().then((d) => setUserName(d?.user?.name || null));
    const onLogout = () => setUserName(null);
    window.addEventListener("login", onLogin);
    window.addEventListener("logout", onLogout);
    return () => {
      window.removeEventListener("login", onLogin);
      window.removeEventListener("logout", onLogout);
    };
  }, []);

  async function handleLogout() {
    await authAPI.logout();
    setUserName(null);
    window.dispatchEvent(new Event("logout"));
    router.refresh();
  }

  /* 카테고리 & 메뉴 데이터 fetch */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [menuRes, catRes] = await Promise.all([
          fetchPublic("/menu"),
          fetchPublic("/admin/categories"),
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
    <div className={`${styles.page} fade-in`}>
      {/* ── 헤더 ─────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/order" className={styles.logo}>
            <span>NCAFE</span>
          </Link>
          <div className={styles.headerRight}>
            <p className={styles.headerTagline}>
              ESSENTIAL COFFEE ROASTERS
            </p>

            {/* 장바구니 아이콘 */}
            <button
              className={styles.cartButton}
              onClick={() => setIsCartOpen(!isCartOpen)}
              aria-label="장바구니"
            >
              <span className={styles.cartIconWrap}>
                <ShoppingCart size={16} />
                {getTotalItems() > 0 && (
                  <span className={styles.cartBadge}>{getTotalItems()}</span>
                )}
              </span>
              <span>CART</span>
            </button>

            {userName ? (
              <div className={styles.userArea}>
                <span className={styles.userName}>{userName}</span>
                <button
                  className={styles.logoutBtn}
                  onClick={handleLogout}
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link href="/login" className={styles.loginBtn}>
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── 장바구니 드롭다운 ─────────────── */}
      {isCartOpen && (
        <div className={styles.cartDropdown}>
          <CartDropdown onClose={() => setIsCartOpen(false)} />
        </div>
      )}

      {/* ── 검색 & 카테고리 ─────────────── */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="SEARCH MENU"
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
            ALL
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
            <p>NO RESULTS FOUND</p>
          </div>
        ) : (
          Object.entries(groupedMenus).map(([catName, items]) => (
            <section key={catName} className={styles.menuSection}>
              <h2 className={styles.sectionTitle}>
                {catName}
                <span className={styles.sectionCount}>({items.length})</span>
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
        <p>© 2026 NCAFE. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}

/* ── 메뉴 카드 컴포넌트 ──────────────────── */
function MenuCard({ menu }: { menu: MenuItem }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!menu.isSoldOut) {
      addToCart({
        menuId: menu.id,
        korName: menu.korName,
        engName: menu.engName,
        price: menu.price,
        imageSrc: menu.imageSrc,
        categoryName: menu.categoryName,
      });
    }
  };

  return (
    <div className={styles.cardWrapper}>
      <Link href={`/order/${menu.id}`} className={styles.cardLink}>
        <article
          className={`${styles.card} ${menu.isSoldOut ? styles.cardSoldOut : ""}`}
        >
          <div className={styles.cardImage}>
            {menu.imageSrc ? (
              <img src={resolvePublicImageSrc(menu.imageSrc) || ""} alt={menu.korName} />
            ) : (
              <div className={styles.cardPlaceholder}>
                <span>NO IMAGE</span>
              </div>
            )}
            {menu.isSoldOut && (
              <div className={styles.soldOutOverlay}>
                <span>SOLD OUT</span>
              </div>
            )}
          </div>

          <div className={styles.cardBody}>
            <div className={styles.cardCategory}>{menu.categoryName}</div>
            <h3 className={styles.cardName}>{menu.korName}</h3>
            <p className={styles.cardEngName}>{menu.engName}</p>
            <div className={styles.cardFooter}>
              <span className={styles.cardPrice}>
                {(menu.price ?? 0).toLocaleString()} KRW
              </span>
            </div>
          </div>
        </article>
      </Link>
      <button
        className={`${styles.addToCartBtn} ${menu.isSoldOut ? styles.disabled : ""}`}
        onClick={handleAddToCart}
        disabled={menu.isSoldOut}
      >
        ADD TO CART
      </button>
    </div>
  );
}

/* ── 장바구니 드롭다운 컴포넌트 ───────────── */
function CartDropdown({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  return (
    <>
      <div className={styles.cartOverlay} onClick={onClose} />
      <div className={styles.cartPanel}>
        <div className={styles.cartHeader}>
          <h3>CART</h3>
          <button className={styles.cartCloseBtn} onClick={onClose} aria-label="닫기">
            CLOSE
          </button>
        </div>

        <div className={styles.cartBody}>
          {items.length === 0 ? (
            <div className={styles.cartEmpty}>
              <p>YOUR CART IS EMPTY</p>
            </div>
          ) : (
            <>
              {items.map((item) => {
                const optionsKey = getCartItemOptionsKey(item.options);
                const optionDelta = item.options?.reduce((sum, opt) => sum + opt.priceDelta, 0) ?? 0;
                const unitPrice = item.price + optionDelta;
                const subtotal = unitPrice * item.quantity;

                return (
                  <div
                    key={`${item.menuId}:${optionsKey}`}
                    className={styles.cartItem}
                  >
                    <div className={styles.cartItemImage}>
                      {item.imageSrc ? (
                        <img src={resolvePublicImageSrc(item.imageSrc) || ""} alt={item.korName} />
                      ) : (
                        <div className={styles.cardPlaceholder} style={{ fontSize: "10px" }}>NO IMAGE</div>
                      )}
                    </div>
                    <div className={styles.cartItemInfo}>
                      <h4>{item.korName}</h4>
                      <p className={styles.cartItemPrice}>
                        {`단가: ${unitPrice.toLocaleString()} KRW | 수량: ${item.quantity} | 소계: ${subtotal.toLocaleString()} KRW`}
                      </p>
                      <div className={styles.cartItemActions}>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.menuId,
                              item.quantity - 1,
                              optionsKey,
                            )
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.menuId,
                              item.quantity + 1,
                              optionsKey,
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className={styles.cartItemRemove}
                      onClick={() => removeFromCart(item.menuId, optionsKey)}
                    >
                      REMOVE
                    </button>
                  </div>
                );
              })}

              <div className={styles.cartFooter}>
                <div className={styles.cartTotal}>
                  <span>TOTAL</span>
                  <span className={styles.cartTotalPrice}>
                    {(getTotalPrice() ?? 0).toLocaleString()} KRW
                  </span>
                </div>
                <button
                  className={styles.cartCheckoutBtn}
                  onClick={() => {
                    onClose();
                    router.push("/checkout");
                  }}
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
