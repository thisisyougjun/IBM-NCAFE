"use client";

import { Search, Bell, HelpCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";
import { authAPI } from "@/app/lib/api";
import styles from "./AdminHeader.module.css";

interface AdminHeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export default function AdminHeader({
  title = "대시보드",
  showSearch = false,
  onSearch,
  searchPlaceholder = "검색...",
}: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await authAPI.logout();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>

      <div className={styles.right}>
        {showSearch && (
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        )}

        <ThemeToggle />

        <button className={`${styles.iconButton} ${styles.notificationBadge}`}>
          <Bell size={20} />
          <span className={styles.badge} />
        </button>

        <button className={styles.iconButton}>
          <HelpCircle size={20} />
        </button>

        <button
          id="logout-button"
          className={styles.iconButton}
          onClick={handleLogout}
          title="로그아웃"
          aria-label="로그아웃"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
