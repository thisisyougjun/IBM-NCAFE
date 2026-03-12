"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from "react";

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

const STORAGE_KEY = "ncafe_cart_v1";

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

  // localStorage → state 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // state → localStorage 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

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
