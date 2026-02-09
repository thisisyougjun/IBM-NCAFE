import { useState, useEffect } from "react";
import { Menu } from "@/types";
import { mockCategories } from "@/mocks/menuData";

export interface MenuResponse {
  id: number;
  korName: string;
  engName: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  imageSrc: string;
  isAvailable: boolean;
  isSoldOut: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);

  const fetchMenus = async () => {
    // 항상 전체 메뉴를 가져옴 (필터링은 프론트엔드에서 수행)
    const url = "http://localhost:8080/admin/menus";

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch menus");
      }
      const data = await response.json();
      console.log("-------------------------------------------------");
      console.log(data);
      console.log("-------------------------------------------------");

      // 백엔드 데이터를 프론트엔드 Menu 타입으로 변환
      const mappedMenus: Menu[] = data.menus.map((item: MenuResponse) => {
        let imageUrl = item.imageSrc || "";
        if (imageUrl && !imageUrl.startsWith("http")) {
          if (imageUrl.startsWith("/")) {
            imageUrl = `http://localhost:8080${imageUrl}`;
          } else {
            imageUrl = `http://localhost:8080/image/${imageUrl}`;
          }
        }

        return {
          id: String(item.id),
          korName: item.korName,
          engName: item.engName,
          description: item.description || "",
          price: item.price || 0,
          category: {
            id: String(item.categoryId || ""),
            korName: item.categoryName || "",
            engName: "",
            sortOrder: 0,
          },
          images: imageUrl
            ? [
                {
                  id: `img-${item.id}`,
                  url: imageUrl,
                  isPrimary: true,
                  sortOrder: 0,
                },
              ]
            : [],
          isAvailable: item.isAvailable ?? true,
          isSoldOut: item.isSoldOut ?? false,
          sortOrder: item.sortOrder || 0,
          options: [],
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        };
      });

      setMenus(mappedMenus);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return { menus, setMenus };
}
