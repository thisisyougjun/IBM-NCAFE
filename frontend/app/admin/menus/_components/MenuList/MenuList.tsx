import { useState, useMemo } from "react";
import { Menu } from "@/types";
import MenuCard from "../MenuCard";
import styles from "./MenuList.module.css";

interface MenuListProps {
  selectedCategory: number | undefined;
  searchQuery: string | undefined;
  menus: Menu[];
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
}

export default function MenuList({
  selectedCategory,
  searchQuery,
  menus,
  setMenus,
}: MenuListProps) {
  // 필터링된 메뉴 목록 (useMemo로 최적화)
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      // 카테고리 필터
      if (
        selectedCategory &&
        String(menu.category.id) !== String(selectedCategory)
      ) {
        return false;
      }
      // 검색어 필터
      if (searchQuery && !menu.korName.includes(searchQuery)) {
        return false;
      }
      return true;
    });
  }, [menus, selectedCategory, searchQuery]);

  const handleToggleSoldOut = (id: string, isSoldOut: boolean) => {
    setMenus(
      menus.map((menu) => (menu.id === id ? { ...menu, isSoldOut } : menu)),
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("정말 이 메뉴를 삭제하시겠습니까?")) {
      setMenus(menus.filter((menu) => menu.id !== id));
    }
  };

  return (
    <div>
      <div className={styles.grid}>
        {filteredMenus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            onToggleSoldOut={handleToggleSoldOut}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
