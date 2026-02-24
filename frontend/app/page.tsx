"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.page}>
      {/* ── Navbar ──────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.navLogo}>NCAFE</span>
          <div className={styles.navLinks}>
            <Link href="/order">MENU</Link>
            <Link href="/admin">ADMIN</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p
            className={`${styles.heroSub} ${isVisible ? styles.fadeInUp : ""}`}
          >
            SINCE 2026
          </p>
          <h1
            className={`${styles.heroTitle} ${
              isVisible ? styles.fadeInUp2 : ""
            }`}
          >
            WE BREW
          </h1>
          <h2
            className={`${styles.heroAccent} ${
              isVisible ? styles.fadeInUp3 : ""
            }`}
          >
            COFFEE
          </h2>
          <h1
            className={`${styles.heroTitle2} ${
              isVisible ? styles.fadeInUp4 : ""
            }`}
          >
            THAT TASTES DAMN
          </h1>
        </div>

        {/* GOOD - 큰 텍스트 */}
        <div className={styles.heroBottom}>
          <span
            className={`${styles.heroGiant} ${
              isVisible ? styles.fadeInScale : ""
            }`}
          >
            GO
          </span>
          <div
            className={`${styles.heroCircle} ${
              isVisible ? styles.fadeInMascot : ""
            }`}
          >
            <img
              src="/images/mascot.png"
              alt="NCAFE 마스코트"
              className={styles.mascotImage}
            />
          </div>
          <span
            className={`${styles.heroGiant} ${
              isVisible ? styles.fadeInScale2 : ""
            }`}
          >
            OD
          </span>
        </div>
      </section>

      {/* ── Marquee ────────────────────── */}
      <div className={styles.marqueeWrapper}>
        <div className={styles.marquee} ref={marqueeRef}>
          <span>
            AMERICANO ✦ LATTE ✦ CAPPUCCINO ✦ COLD BREW ✦ ESPRESSO ✦ MOCHA ✦
            CROISSANT ✦&nbsp;
          </span>
          <span>
            AMERICANO ✦ LATTE ✦ CAPPUCCINO ✦ COLD BREW ✦ ESPRESSO ✦ MOCHA ✦
            CROISSANT ✦&nbsp;
          </span>
        </div>
      </div>

      {/* ── About Section ──────────────── */}
      <section className={styles.about}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutLeft}>
            <p className={styles.aboutLabel}>ABOUT US</p>
            <h2 className={styles.aboutTitle}>
              매일 아침,
              <br />
              당신의 하루를
              <br />
              <span className={styles.aboutHighlight}>깨워줄</span> 한 잔.
            </h2>
          </div>
          <div className={styles.aboutRight}>
            <p className={styles.aboutText}>
              NCAFE는 엄선된 원두만을 사용하여 최고의 커피를 만들어냅니다.
              바리스타의 정성이 담긴 한 잔 한 잔이 당신의 일상에 작은 여유를
              선물합니다.
            </p>
            <p className={styles.aboutText}>
              디저트와 음료 모두 매일 신선하게 준비되며, 최상의 재료만으로
              정직하게 만듭니다.
            </p>
            <div className={styles.aboutStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>17+</span>
                <span className={styles.statLabel}>메뉴</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>5</span>
                <span className={styles.statLabel}>카테고리</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>100%</span>
                <span className={styles.statLabel}>신선한 원두</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Section ─────────── */}
      <section className={styles.categories}>
        <h2 className={styles.catTitle}>
          OUR
          <br />
          <span className={styles.catAccent}>MENU</span>
        </h2>

        <div className={styles.catGrid}>
          {[
            { name: "커피", eng: "COFFEE", emoji: "☕", count: "6" },
            { name: "논커피", eng: "NON-COFFEE", emoji: "🥛", count: "3" },
            { name: "디저트", eng: "DESSERT", emoji: "🍰", count: "3" },
            { name: "스무디/주스", eng: "SMOOTHIE", emoji: "🥤", count: "2" },
            { name: "티", eng: "TEA", emoji: "🍵", count: "3" },
          ].map((cat, i) => (
            <Link
              key={cat.eng}
              href="/order"
              className={styles.catCard}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className={styles.catEmoji}>{cat.emoji}</span>
              <div className={styles.catInfo}>
                <h3 className={styles.catName}>{cat.eng}</h3>
                <p className={styles.catKor}>{cat.name}</p>
              </div>
              <span className={styles.catCount}>{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA Section ────────────────── */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <p className={styles.ctaLabel}>ORDER NOW</p>
          <h2 className={styles.ctaTitle}>
            지금 바로
            <br />
            <span className={styles.ctaAccent}>메뉴</span>를<br />
            확인하세요
          </h2>
          <Link href="/order" className={styles.ctaButton}>
            메뉴 보러 가기
            <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>NCAFE</span>
            <p>커피 한 잔의 여유</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/order">메뉴</Link>
            <Link href="/admin">관리자</Link>
          </div>
          <p className={styles.footerCopy}>
            © 2026 IBM NCAFE. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
