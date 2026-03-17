"use client";

import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      {/* ── Navbar ──────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>NCAFE</Link>
          <div className={styles.navLinks}>
            <Link href="/order">MENU</Link>
            <Link href="/login">LOGIN</Link>
            <Link href="/admin">ADMIN</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroSub}>ERROR 404</p>
          <h1 className={styles.heroTitle}>404</h1>
          <h2 className={styles.heroAccent}>
            존재하지 않는 페이지입니다
          </h2>
          <Link href="/" className={styles.ctaButton}>
            <span>홈으로 돌아가기</span>
            <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
