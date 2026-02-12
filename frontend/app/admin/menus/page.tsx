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
  // 커스텀 훅에 상태를 전달하여 필터링된 메뉴를 가져옵니다.
  const { menus, setMenus } = useMenus(selectedCategory, searchQuery);

  return (
    <main>
      {/* 페이지 헤더 */}
      <MenusPageHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 카테고리 탭 */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* 메뉴 그리드 */}
      <MenuList
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        menus={menus}
        setMenus={setMenus}
      />
    </main>
  );
}
