"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import MenuDetailHeader from "./_components/MenuDetailHeader";
import MenuDetailInfo from "./_components/MenuDetailInfo";
import MenuImages from "./_components/MenuImages";
import MenuOptions from "./_components/MenuOptions";
import { useMenuDetail } from "./_hooks/useMenuDetail";
import { useMenuDelete } from "./_hooks/useMenuDelete";
import styles from "./page.module.css";

interface MenuDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MenuDetailPage({ params }: MenuDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Custom hooks 사용
  const { menu, isLoading, error } = useMenuDetail(id);
  const { handleDelete } = useMenuDelete(id);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        메뉴 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">메뉴를 찾을 수 없습니다</h2>
        <button
          onClick={() => router.push("/admin/menus")}
          className="text-blue-500 hover:underline"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <main>
      <MenuDetailHeader
        title={menu.korName}
        menuId={menu.id}
        onDelete={handleDelete}
      />

      <div className={styles.pageLayout}>
        <div className={styles.column}>
          <MenuImages
            images={menu.images}
            altText={menu.korName}
            description={menu.description}
          />
          <MenuDetailInfo menu={menu} />
        </div>

        <div className={styles.column}>
          <MenuOptions options={menu.options} />
        </div>
      </div>
    </main>
  );
}
