"use client";

import LoginForm from "@/components/auth/LoginForm/LoginForm";
import styles from "./page.module.css";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginWrapper}>
        <div className={styles.logoContainer}>
          <Image
            src="/hero-coffee.png"
            alt="New Cafe Logo"
            width={80}
            height={80}
            className={styles.logoImage}
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
