import { useState, useEffect } from "react";
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
    const controller = new AbortController();

    const fetchMenus = async () => {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.set("categoryId", selectedCategory.toString());
      }
      if (searchQuery) {
        params.set("searchQuery", searchQuery);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/admin/menu?${queryString}` : "/api/admin/menu";

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 401 || response.status === 403) {
            window.location.href = "/admin/login";
            return;
          }
          throw new Error(
            `Failed to fetch menus (${response.status}): ${errorText || response.statusText}`,
          );
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

        const sortedMenus = [...(data.menus || [])].sort((a: MenuResponse, b: MenuResponse) => {
          // 품절 메뉴를 하단으로 정렬해서 상태가 자연스럽게 모이도록 처리
          if (a.isSoldOut !== b.isSoldOut) return a.isSoldOut ? 1 : -1;
          return a.korName.localeCompare(b.korName, "ko");
        });

        setMenus(sortedMenus);

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
        if (controller.signal.aborted) return;
        console.error("Error fetching menus:", error);
        setMenus([]);
      }
    };

    fetchMenus();

    return () => controller.abort();
  }, [selectedCategory, searchQuery]);

  return { menus, setMenus };
}
