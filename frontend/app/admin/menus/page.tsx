"use client";

import { useState } from "react";
import CategoryTabs from "./_components/CategoryTabs";
import MenuList from "./_components/MenuList";
import MenusPageHeader from "./_components/MenusPageHeader";

import { useMenus } from "./_components/MenuList/useMenus";

export default function MenusPage() {
  // 상태
  // Lifting State Up
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined,
  );
  const { menus, setMenus } = useMenus(); // 전체 메뉴 로딩

  return (
    <main>
      {/* 페이지 헤더 */}
      <MenusPageHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 카테고리 탭 (menus 전달) */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        menus={menus}
      />

      {/* 메뉴 그리드 (menus 전달) */}
      <MenuList
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        menus={menus}
        setMenus={setMenus}
      />
    </main>
  );
}
