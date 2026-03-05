"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/app/lib/api";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.adminLogin(username, password);
      if (!data) {
        setError("로그인에 실패했습니다.");
        return;
      }
      // Client Cache를 우회하고 서버에서 새 쿠키 기반으로 페이지를 렌더링하도록 하드 이동
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || "서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <span className={styles.logo}>NCAFE</span>
          <p className={styles.logoSub}>관리자 포털</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="username">
              아이디
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className={styles.input}
              placeholder="관리자 아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={styles.input}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <span className={styles.errorIcon}>⚠</span>
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <span>로그인</span>
            )}
          </button>
        </form>

        <p className={styles.hint}>
          NCAFE 관리자만 접근 가능한 페이지입니다.
        </p>
      </div>

      {/* 배경 장식 */}
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />
      <div className={styles.bgCircle3} />
    </div>
  );
}
