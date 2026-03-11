"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
  removeFromCart: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

/* ── Context 생성 ──────────────────────── */
const CartContext = createContext<CartContextType | undefined>(undefined);

/* ── Provider 컴포넌트 ───────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      // 동일한 메뉴가 이미 있는지 확인
      const existingItem = prevItems.find((i) => i.menuId === item.menuId);

      if (existingItem) {
        // 이미 있으면 수량만 증가
        return prevItems.map((i) =>
          i.menuId === item.menuId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // 없으면 새로 추가
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((menuId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.menuId !== menuId));
  }, []);

  const updateQuantity = useCallback((menuId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuId === menuId ? { ...item, quantity } : item
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
