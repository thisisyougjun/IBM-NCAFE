import { MenuCategory, Menu } from "@/types";
import styles from "./CategoryTabs.module.css";
import { CategoryResponseDto, useCategories } from "./useCategories";
import { useState } from "react";

export default function CategoryTabs({
  selectedCategory,
  setSelectedCategory,
  menus,
}: {
  selectedCategory: number | undefined;
  setSelectedCategory: (id: number) => void;
  menus: Menu[];
}) {
  const { categories } = useCategories();

  // 카테고리별 메뉴 개수 계산
  const getMenuCount = (categoryId: number | null) => {
    if (categoryId === null) return menus.length;
    return menus.filter(
      (menu) => String(menu.category.id) === String(categoryId),
    ).length;
  };

  return (
    <div className={styles.tabs}>
      {/* 전체 탭 */}
      <button
        className={`${styles.tab} ${selectedCategory === undefined ? styles.tabActive : ""}`}
        onClick={() => setSelectedCategory(undefined as any)}
      >
        <span className={styles.tabIcon}>📋</span>
        전체
        <span className={styles.tabCount}>{getMenuCount(null)}</span>
      </button>

      {/* 카테고리별 탭 */}
      {categories.map((category: CategoryResponseDto) => (
        <button
          key={category.id}
          className={`${styles.tab} ${selectedCategory === category.id ? styles.tabActive : ""}`}
          onClick={() => {
            setSelectedCategory(category.id);
          }}
        >
          <span className={styles.tabIcon}>{category.icon}</span>
          {category.name}
          <span className={styles.tabCount}>{getMenuCount(category.id)}</span>
        </button>
      ))}
    </div>
  );
}
