"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/_components/ThemeProvider";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label={theme === "light" ? "다크모드로 전환" : "라이트모드로 전환"}
      title={theme === "light" ? "다크모드로 전환" : "라이트모드로 전환"}
    >
      {theme === "light" ? (
        <Moon size={20} className={styles.icon} />
      ) : (
        <Sun size={20} className={styles.icon} />
      )}
    </button>
  );
}
