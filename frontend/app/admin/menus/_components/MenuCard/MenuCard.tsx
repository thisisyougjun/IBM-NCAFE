import styles from "./MenuCard.module.css";
import Image from "next/image";
import Button from "@/components/common/Button";
import { Edit, Trash, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { MenuResponse } from "../MenuList/useMenus";

interface MenuCardProps {
  menu: MenuResponse;
}

export default function MenuCard({ menu }: MenuCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Link href={`/admin/menus/${menu.id}`}>
          {menu.imageSrc ? (
            // http://localhost:8080/api/v1/admin/menus
            // http://localhost:3000/api/v1/images/1.jpg
            <Image
              src={`/images/${menu.imageSrc}`}
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
          <Link href={`/admin/menus/${menu.id}`} className={styles.nameLink}>
            <h3 className={styles.name}>{menu.korName}</h3>
          </Link>
          <span className={styles.price}>{menu.price.toLocaleString()}원</span>
        </div>
        <p className={styles.engName}>{menu.engName}</p>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            className={menu.isSoldOut ? styles.actionActive : ""}
          >
            {menu.isSoldOut ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
          <Link href={`/admin/menus/${menu.id}`}>
            <Button variant="ghost" size="sm">
              <Edit size={18} />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className={styles.deleteButton}>
            <Trash size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
