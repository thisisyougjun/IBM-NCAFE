"use client";

import MenuCard from "../MenuCard";
import styles from "./MenuList.module.css";
import { MenuResponse } from "./useMenus";
import { useRouter } from "next/navigation";
import { menuToSlug } from "@/app/admin/_lib/menuSlug";

interface MenuListProps {
  menus: MenuResponse[];
  setMenus: React.Dispatch<React.SetStateAction<MenuResponse[]>>;
}

export default function MenuList({
  menus,
  setMenus,
}: MenuListProps) {
  const router = useRouter();
  const activeMenus = menus.filter((menu) => !menu.isSoldOut);
  const soldOutMenus = menus.filter((menu) => menu.isSoldOut);

  const updateMenu = async (id: number, payload: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "메뉴 수정에 실패했습니다." }));
      throw new Error(err.message || "메뉴 수정에 실패했습니다.");
    }

    return res.json();
  };

  const handleToggleSoldOut = async (menu: MenuResponse) => {
    const nextSoldOut = !menu.isSoldOut;

    try {
      const updated = await updateMenu(menu.id, {
        isSoldOut: nextSoldOut,
      });

      setMenus((prev) =>
        prev.map((m) =>
          m.id === menu.id
            ? { ...m, isSoldOut: updated.isSoldOut ?? nextSoldOut }
            : m,
        ),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "품절 상태 변경에 실패했습니다.");
    }
  };

  const handleUpdatePrice = async (menu: MenuResponse, price: number) => {
    try {
      const updated = await updateMenu(menu.id, { price });
      setMenus((prev) =>
        prev.map((m) =>
          m.id === menu.id ? { ...m, price: updated.price ?? price } : m,
        ),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "가격 수정에 실패했습니다.");
    }
  };

  const handleEditOptions = (menu: MenuResponse) => {
    const slug = menuToSlug(menu);
    router.push(`/admin/menu/${slug}#options`);
  };

  return (
    <div>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>판매중 메뉴</h2>
          <span className={styles.sectionCount}>{activeMenus.length}개</span>
        </div>
        <div className={styles.grid}>
          {activeMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              detailHref={`/admin/menu/${menuToSlug(menu)}`}
              onToggleSoldOut={() => handleToggleSoldOut(menu)}
              onUpdatePrice={(price) => handleUpdatePrice(menu, price)}
              onEditOptions={() => handleEditOptions(menu)}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>품절 메뉴</h2>
          <span className={styles.sectionCount}>{soldOutMenus.length}개</span>
        </div>
        {soldOutMenus.length === 0 ? (
          <p className={styles.emptySection}>현재 품절 메뉴가 없습니다.</p>
        ) : (
          <div className={styles.grid}>
            {soldOutMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                detailHref={`/admin/menu/${menuToSlug(menu)}`}
                onToggleSoldOut={() => handleToggleSoldOut(menu)}
                onUpdatePrice={(price) => handleUpdatePrice(menu, price)}
                onEditOptions={() => handleEditOptions(menu)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
