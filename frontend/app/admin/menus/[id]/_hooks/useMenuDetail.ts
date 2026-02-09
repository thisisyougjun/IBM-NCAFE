import { useState, useEffect } from "react";
import { Menu } from "@/types";

export function useMenuDetail(id: string) {
  const [menu, setMenu] = useState<Menu | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuAndImages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 메뉴 상세 정보와 이미지 목록을 병렬로 호출
        const [menuResponse, imagesResponse] = await Promise.all([
          fetch(`http://localhost:8080/admin/menus/${id}`),
          fetch(`http://localhost:8080/admin/menus/${id}/menu-images`),
        ]);

        if (!menuResponse.ok) {
          setError("메뉴를 찾을 수 없습니다");
          setMenu(undefined);
          return;
        }

        const menuDataRes = await menuResponse.json();
        let imagesList = [];

        // 이미지 API 응답 처리 (성공 시에만)
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          if (imagesData.images && Array.isArray(imagesData.images)) {
            imagesList = imagesData.images.map((img: any) => {
              // URL 처리 로직
              let imageUrl = img.url;
              if (!imageUrl.startsWith("http")) {
                if (imageUrl.startsWith("/")) {
                  imageUrl = `http://localhost:8080${imageUrl}`;
                } else {
                  imageUrl = `http://localhost:8080/image/${imageUrl}`;
                }
              }

              return {
                id: String(img.id),
                url: imageUrl,
                isPrimary: img.isPrimary,
                sortOrder: img.sortOrder,
              };
            });
          }
        }

        // Backend 응답을 Frontend Menu 타입으로 변환
        const menuData: Menu = {
          id: String(menuDataRes.id),
          korName: menuDataRes.korName,
          engName: menuDataRes.engName,
          description: menuDataRes.description || "",
          price: menuDataRes.price,
          category: {
            id: String(menuDataRes.categoryId || ""),
            korName: menuDataRes.categoryName || "",
            engName: "",
            sortOrder: 0,
          },
          images:
            imagesList.length > 0
              ? imagesList
              : menuDataRes.imageSrc
                ? [
                    {
                      id: "1",
                      url: menuDataRes.imageSrc.startsWith("http")
                        ? menuDataRes.imageSrc
                        : `http://localhost:8080${menuDataRes.imageSrc}`,
                      isPrimary: true,
                      sortOrder: 0,
                    },
                  ]
                : [],
          isAvailable: menuDataRes.isAvailable ?? true,
          isSoldOut: menuDataRes.isSoldOut ?? false,
          sortOrder: menuDataRes.sortOrder || 0,
          options: [],
          createdAt: menuDataRes.createdAt
            ? new Date(menuDataRes.createdAt)
            : new Date(),
          updatedAt: menuDataRes.updatedAt
            ? new Date(menuDataRes.updatedAt)
            : new Date(),
        };

        setMenu(menuData);
      } catch (error) {
        console.error("메뉴 조회 실패:", error);
        setError("메뉴 조회 중 오류가 발생했습니다");
        setMenu(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuAndImages();
  }, [id]);

  return { menu, isLoading, error };
}
