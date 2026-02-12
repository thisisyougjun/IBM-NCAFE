import { useState, useMemo } from "react";
import MenuCard from "../MenuCard";
import styles from "./MenuList.module.css";
import { MenuResponse } from "./useMenus";

interface MenuListProps {
  selectedCategory: number | undefined;
  searchQuery: string | undefined;
  menus: MenuResponse[];
  setMenus: React.Dispatch<React.SetStateAction<MenuResponse[]>>;
}

export default function MenuList({
  selectedCategory,
  searchQuery,
  menus,
  setMenus,
}: MenuListProps) {
  // 서버에서 이미 필터링되어 오므로 filteredMenus 로직 제거하고 직접 사용
  const handleToggleSoldOut = (id: number, isSoldOut: boolean) => {
    setMenus(
      menus.map((menu) => (menu.id === id ? { ...menu, isSoldOut } : menu)),
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("정말 이 메뉴를 삭제하시겠습니까?")) {
      setMenus(menus.filter((menu) => menu.id !== id));
    }
  };

  return (
    <div>
      <div className={styles.grid}>
        {menus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            // onToggleSoldOut={handleToggleSoldOut} // MenuCard에서 사용하도록 추가 가능
            // onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
