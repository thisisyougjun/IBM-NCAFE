"use client";

import styles from "./MenuCard.module.css";
import Image from "next/image";
import Button from "@/components/common/Button";
import { Eye, EyeOff, Settings2 } from "lucide-react";
import Link from "next/link";
import { MenuResponse } from "../MenuList/useMenus";
import { resolvePublicImageSrc } from "@/app/lib/publicFetch";
import { useEffect, useState } from "react";

interface MenuCardProps {
  menu: MenuResponse;
  detailHref: string;
  onToggleSoldOut: () => void;
  onUpdatePrice: (price: number) => void;
  onEditOptions: () => void;
}

export default function MenuCard({
  menu,
  detailHref,
  onToggleSoldOut,
  onUpdatePrice,
  onEditOptions,
}: MenuCardProps) {
  const [priceDraft, setPriceDraft] = useState(menu.price ?? 0);

  useEffect(() => {
    setPriceDraft(menu.price ?? 0);
  }, [menu.price]);

  const handlePriceSave = () => {
    if (!Number.isFinite(priceDraft) || priceDraft < 0) {
      alert("가격은 0원 이상이어야 합니다.");
      setPriceDraft(menu.price ?? 0);
      return;
    }
    if (priceDraft === menu.price) return;
    onUpdatePrice(priceDraft);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Link href={detailHref}>
          {menu.imageSrc ? (
            // /api/v1/admin/menus
            // /api/v1/images/1.jpg
            <Image
              src={resolvePublicImageSrc(menu.imageSrc) || ""}
              alt={menu.korName}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={styles.noImage}>No Image</div>
          )}
        </Link>
        <div className={styles.badges}>
          {menu.isSoldOut && <span className={styles.badgeSoldOut}>품절</span>}
          {!menu.isAvailable && (
            <span className={styles.badgeHidden}>숨김</span>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <Link href={detailHref} className={styles.nameLink}>
            <h3 className={styles.name}>{menu.korName}</h3>
          </Link>
        </div>
        <p className={styles.engName}>{menu.engName}</p>

        <div className={styles.priceEditor}>
          <label className={styles.priceLabel}>가격</label>
          <div className={styles.priceControls}>
            <input
              type="number"
              className={styles.priceInput}
              value={priceDraft}
              onChange={(e) => setPriceDraft(Number(e.target.value))}
              onBlur={handlePriceSave}
              min={0}
              step={100}
            />
            <button type="button" className={styles.priceSaveButton} onClick={handlePriceSave}>
              저장
            </button>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            className={menu.isSoldOut ? styles.actionActive : ""}
            onClick={onToggleSoldOut}
          >
            {menu.isSoldOut ? <EyeOff size={18} /> : <Eye size={18} />}
            <span>{menu.isSoldOut ? "품절 해제" : "품절 처리"}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onEditOptions}>
            <Settings2 size={18} />
            <span>옵션 수정</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
