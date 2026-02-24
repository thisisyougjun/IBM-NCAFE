import { useState, useEffect } from "react";
import { Menu } from "@/types";
import { mockCategories } from "@/mocks/menuData";

export interface MenuResponse {
  id: number;
  korName: string;
  engName: string;
  description: string;
  price: number;
  categoryName: string;
  imageSrc: string;
  isAvailable: boolean;
  isSoldOut: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuListResponse {
  menus: MenuResponse[];
  total: number;
}

export function useMenus(
  selectedCategory: number | undefined,
  searchQuery: string | undefined,
) {
  const [menus, setMenus] = useState<MenuResponse[]>([]);

  useEffect(() => {
    const fetchMenus = async () => {
      const url = new URL(`/api/admin/menu`, window.location.origin);

      const params = url.searchParams;
      if (selectedCategory) {
        params.set("categoryId", selectedCategory.toString());
      }
      if (searchQuery) {
        params.set("searchQuery", searchQuery);
      }

      try {
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Failed to fetch menus");
        }
        const data = await response.json();

        console.log("📋 [메뉴 목록] API 응답 데이터:", data);
        console.log(`📊 총 ${data.total}개 메뉴 로드됨`);
        console.table(
          data.menus.map((m: MenuResponse) => ({
            ID: m.id,
            메뉴명: m.korName,
            영문명: m.engName,
            가격: `${m.price?.toLocaleString()}원`,
            카테고리: m.categoryName,
            판매여부: m.isAvailable ? "✅" : "❌",
          })),
        );

        setMenus(data.menus);

        // 백엔드 데이터를 프론트엔드 Menu 타입으로 변환
        // const mappedMenus: MenuResponse[] = data.map((item: any) => ({
        //     id: String(item.id),
        //     korName: item.korName,
        //     engName: item.engName,
        //     description: item.description,
        //     price: parseInt(item.price) || 0,
        //     // 카테고리 정보가 없으므로 임시로 첫 번째 카테고리 할당
        //     category: mockCategories[0],
        //     images: item.image ? [{
        //         id: `img-${item.id}`,
        //         url: item.image,
        //         isPrimary: true,
        //         sortOrder: 0
        //     }] : [],
        //     isAvailable: true,
        //     isSoldOut: false,
        //     sortOrder: item.id, // 임시 정렬 순서
        //     options: [],
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // }));

        // setMenus(data);
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };

    fetchMenus();
  }, [selectedCategory, searchQuery]);

  return { menus, setMenus };
}
