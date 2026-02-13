"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { Coffee, Users, TrendingUp, ShoppingCart, ArrowRight } from "lucide-react";

export default function Home() {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <div className={styles.page}>
      {/* Hero Section - Apple Style */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>IBM NCAFE</h1>
          <p className={styles.heroSubtitle}>카페 운영의 새로운 기준</p>
          <div className={styles.heroCtas}>
            <Link href="/admin" className={styles.ctaPrimary}>
              시작하기
            </Link>
            <a href="#learn-more" className={styles.ctaSecondary} onClick={handleSmoothScroll}>
              더 알아보기 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Product Highlight 1 - Dark Background */}
      <section className={styles.productSection} id="learn-more">
        <div className={styles.productContent}>
          <h2 className={styles.productTitle}>메뉴 관리</h2>
          <p className={styles.productSubtitle}>
            직관적인 인터페이스로 메뉴를 손쉽게 관리하세요
          </p>
          <div className={styles.productFeatures}>
            <div className={styles.productFeature}>
              <Coffee size={24} />
              <span>빠른 메뉴 등록</span>
            </div>
            <div className={styles.productFeature}>
              <TrendingUp size={24} />
              <span>실시간 재고 관리</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlight 2 - Light Background */}
      <section className={styles.productSectionLight}>
        <div className={styles.productContent}>
          <h2 className={styles.productTitleDark}>매출 분석</h2>
          <p className={styles.productSubtitleDark}>
            데이터 기반 의사결정으로 더 나은 비즈니스를 만드세요
          </p>
          <div className={styles.productFeaturesDark}>
            <div className={styles.productFeatureDark}>
              <TrendingUp size={24} />
              <span>실시간 매출 현황</span>
            </div>
            <div className={styles.productFeatureDark}>
              <ShoppingCart size={24} />
              <span>주문 통계 및 분석</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlight 3 - Dark Background */}
      <section className={styles.productSection}>
        <div className={styles.productContent}>
          <h2 className={styles.productTitle}>직원 관리</h2>
          <p className={styles.productSubtitle}>
            역할별 권한으로 안전하고 효율적인 운영 환경을 제공합니다
          </p>
          <div className={styles.productFeatures}>
            <div className={styles.productFeature}>
              <Users size={24} />
              <span>직원 권한 관리</span>
            </div>
            <div className={styles.productFeature}>
              <ShoppingCart size={24} />
              <span>주문 처리 시스템</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>지금 시작하세요</h2>
          <p className={styles.ctaText}>더 나은 카페 운영의 시작</p>
          <Link href="/admin" className={styles.ctaButton}>
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* Footer - Apple Style */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <a href="#menu" onClick={handleSmoothScroll}>메뉴 관리</a>
            <a href="#sales" onClick={handleSmoothScroll}>매출 분석</a>
            <a href="#staff" onClick={handleSmoothScroll}>직원 관리</a>
            <a href="#support" onClick={handleSmoothScroll}>고객 지원</a>
          </div>
          <p className={styles.footerCopyright}>
            Copyright © 2026 IBM NCAFE. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
