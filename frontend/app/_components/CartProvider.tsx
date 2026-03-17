"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";

/* ── 타입 정의 ───────────────────────────── */
export interface CartItem {
  menuId: number;
  korName: string;
  engName: string;
  price: number;
  quantity: number;
  imageSrc: string | null;
  categoryName: string;
  options?: {
    name: string;
    value: string;
    priceDelta: number;
  }[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (menuId: number, optionsKey?: string) => void;
  updateQuantity: (menuId: number, quantity: number, optionsKey?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const STORAGE_KEY_BASE = "ncafe_cart_v1";
const GUEST_STORAGE_KEY = `${STORAGE_KEY_BASE}:guest`;

type SessionUser = {
  username?: string;
  email?: string;
} | null;

/* ── Context 생성 ──────────────────────── */
const CartContext = createContext<CartContextType | undefined>(undefined);

export function getCartItemOptionsKey(options?: CartItem["options"]) {
  if (!options || options.length === 0) return "";
  // 옵션 순서가 달라도 동일하게 취급하도록 정렬
  const normalized = [...options]
    .map((o) => ({ name: o.name, value: o.value, priceDelta: o.priceDelta }))
    .sort((a, b) => (a.name + ":" + a.value).localeCompare(b.name + ":" + b.value));
  return JSON.stringify(normalized);
}

/* ── Provider 컴포넌트 ───────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storageKey, setStorageKey] = useState(GUEST_STORAGE_KEY);
  const itemsRef = useRef<CartItem[]>([]);
  const storageKeyRef = useRef(GUEST_STORAGE_KEY);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    storageKeyRef.current = storageKey;
  }, [storageKey]);

  const readCartFromStorage = useCallback((key: string): CartItem[] => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const resolveStorageKey = useCallback((user: SessionUser) => {
    if (!user) return GUEST_STORAGE_KEY;
    const userKey = user.username || user.email;
    if (!userKey) return GUEST_STORAGE_KEY;
    return `${STORAGE_KEY_BASE}:user:${userKey}`;
  }, []);

  const syncCartBySession = useCallback(
    async (targetUser?: SessionUser) => {
      try {
        const user =
          targetUser !== undefined
            ? targetUser
            : await fetch("/api/auth/session", { cache: "no-store" })
                .then((res) => (res.ok ? res.json() : { user: null }))
                .then((data) => data?.user ?? null)
                .catch(() => null);

        const nextKey = resolveStorageKey(user);
        const currentKey = storageKeyRef.current;

        if (currentKey === nextKey) return;

        // 현재 장바구니를 기존 키에 저장하고, 다음 키의 장바구니를 로드합니다.
        try {
          localStorage.setItem(currentKey, JSON.stringify(itemsRef.current));
        } catch {
          // ignore
        }

        setItems(readCartFromStorage(nextKey));
        setStorageKey(nextKey);
      } catch {
        // ignore
      }
    },
    [readCartFromStorage, resolveStorageKey]
  );

  // 초기 장바구니 로드 (guest) 후 세션 기준 장바구니로 동기화
  useEffect(() => {
    try {
      setItems(readCartFromStorage(GUEST_STORAGE_KEY));
    } catch {
      // ignore
    }
    void syncCartBySession();
  }, [readCartFromStorage, syncCartBySession]);

  // 로그인/로그아웃 이벤트가 발생하면 세션 사용자에 맞는 장바구니로 전환
  useEffect(() => {
    const handleSessionChanged = () => {
      void syncCartBySession();
    };

    window.addEventListener("login", handleSessionChanged);
    window.addEventListener("logout", handleSessionChanged);

    return () => {
      window.removeEventListener("login", handleSessionChanged);
      window.removeEventListener("logout", handleSessionChanged);
    };
  }, [syncCartBySession]);

  // state → localStorage 저장
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, storageKey]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    const key = getCartItemOptionsKey(item.options);
    setItems((prevItems) => {
      // 동일한 메뉴(+옵션 조합)가 이미 있는지 확인
      const existingItem = prevItems.find(
        (i) => i.menuId === item.menuId && getCartItemOptionsKey(i.options) === key
      );

      if (existingItem) {
        // 이미 있으면 수량만 증가
        return prevItems.map((i) =>
          i.menuId === item.menuId && getCartItemOptionsKey(i.options) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // 없으면 새로 추가
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((menuId: number, optionsKey?: string) => {
    const key = optionsKey ?? "";
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.menuId === menuId && getCartItemOptionsKey(item.options) === key)
      )
    );
  }, []);

  const updateQuantity = useCallback((menuId: number, quantity: number, optionsKey?: string) => {
    if (quantity <= 0) {
      removeFromCart(menuId, optionsKey);
      return;
    }
    const key = optionsKey ?? "";
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuId === menuId && getCartItemOptionsKey(item.options) === key ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => {
      const optionsPrice = item.options?.reduce((sum, opt) => sum + opt.priceDelta, 0) || 0;
      return total + (item.price + optionsPrice) * item.quantity;
    }, 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ── Hook ────────────────────────────── */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
