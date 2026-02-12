"use client";

import { useEffect, useState } from "react"; // 1. useState, useEffect 추가
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/_components/ThemeProvider";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // 2. 마운트 상태 관리

  // 3. 컴포넌트가 브라우저에 나타난 후 실행됨
  useEffect(() => {
    setMounted(true);
  }, []);

  // 4. 서버와 클라이언트의 초기 HTML을 동일하게 맞춤 (마운트 전에는 아무것도 안 그림)
  if (!mounted) {
    return (
      <div className={styles.themeToggle} style={{ width: 40, height: 40 }} />
    );
    // 버튼 크기만큼 빈 공간을 두어 레이아웃 흔들림 방지
  }

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
