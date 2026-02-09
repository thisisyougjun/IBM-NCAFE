import { Menu } from "@/types";
import styles from "./MenuCard.module.css";
import Image from "next/image";
import Button from "@/components/common/Button";
import { Edit, Trash, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface MenuCardProps {
  menu: Menu;
  onToggleSoldOut: (id: string, isSoldOut: boolean) => void;
  onDelete: (id: string) => void;
}

export default function MenuCard({
  menu,
  onToggleSoldOut,
  onDelete,
}: MenuCardProps) {
  const primaryImage =
    menu.images.find((img) => img.isPrimary) || menu.images[0];

  return (
    <div className={styles.card}>
      <Link href={`/admin/menus/${menu.id}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={menu.korName}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={styles.noImage}>No Image</div>
          )}
          <div className={styles.badges}>
            {menu.isSoldOut && (
              <span className={styles.badgeSoldOut}>품절</span>
            )}
            {!menu.isAvailable && (
              <span className={styles.badgeHidden}>숨김</span>
            )}
          </div>
        </div>
      </Link>

      <div className={styles.content}>
        <Link href={`/admin/menus/${menu.id}`} className={styles.link}>
          <div className={styles.header}>
            <h3 className={styles.name}>{menu.korName}</h3>
            <span className={styles.price}>
              {menu.price.toLocaleString()}원
            </span>
          </div>
          <p className={styles.engName}>{menu.engName}</p>
        </Link>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleSoldOut(menu.id, !menu.isSoldOut)}
            className={menu.isSoldOut ? styles.actionActive : ""}
          >
            {menu.isSoldOut ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
          <Link href={`/admin/menus/${menu.id}`}>
            <Button variant="ghost" size="sm">
              <Edit size={18} />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className={styles.deleteButton}
            onClick={() => onDelete(menu.id)}
          >
            <Trash size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
