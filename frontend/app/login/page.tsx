"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Coffee } from "lucide-react";
import { authAPI } from "@/app/lib/api";
import styles from "./page.module.css";

type Tab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/order";

  const [tab, setTab] = useState<Tab>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 로그인 폼
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 회원가입 폼
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authAPI.login(loginUsername, loginPassword);
      if (!data) {
        setError("로그인에 실패했습니다.");
        return;
      }
      window.dispatchEvent(new Event("login"));
      window.location.href = redirect || "/order";
    } catch (err: any) {
      setError(err.message || "서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (regPassword !== regPasswordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.register(regName, regUsername, regEmail, regPassword);
      if (!data) {
        setError("회원가입에 실패했습니다.");
        return;
      }
      window.dispatchEvent(new Event("login"));
      window.location.href = redirect || "/order";
    } catch (err: any) {
      setError(err.message || "서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* 배경 장식 */}
      <div className={styles.bgBlob1} />
      <div className={styles.bgBlob2} />
      <div className={styles.bgPattern} />

      <div className={styles.container}>
        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            {/* 탭 */}
            <div className={styles.tabs}>
              <button
                id="tab-login"
                className={`${styles.tab} ${tab === "login" ? styles.tabActive : ""}`}
                onClick={() => { setTab("login"); setError(""); }}
              >
                로그인
              </button>
              <button
                id="tab-register"
                className={`${styles.tab} ${tab === "register" ? styles.tabActive : ""}`}
                onClick={() => { setTab("register"); setError(""); }}
              >
                회원가입
              </button>
              <div
                className={styles.tabIndicator}
                style={{ transform: tab === "register" ? "translateX(100%)" : "translateX(0)" }}
              />
            </div>

            {/* ── 로그인 폼 ── */}
            {tab === "login" && (
              <form className={styles.form} onSubmit={handleLogin} noValidate>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>돌아오셨군요! 👋</h2>
                  <p className={styles.formSubtitle}>아이디로 로그인하세요</p>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="login-username">아이디</label>
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    className={styles.input}
                    placeholder="아이디를 입력하세요"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="login-password">비밀번호</label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    className={styles.input}
                    placeholder="비밀번호를 입력하세요"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className={styles.error} role="alert">
                    <span>⚠</span> {error}
                  </div>
                )}

                <button id="login-submit" type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : <span>로그인</span>}
                </button>

                <p className={styles.switchText}>
                  계정이 없으신가요?{" "}
                  <button type="button" className={styles.switchLink} onClick={() => { setTab("register"); setError(""); }}>
                    회원가입하기
                  </button>
                </p>
              </form>
            )}

            {/* ── 회원가입 폼 ── */}
            {tab === "register" && (
              <form className={styles.form} onSubmit={handleRegister} noValidate>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>처음 오셨나요? ☕</h2>
                  <p className={styles.formSubtitle}>간단히 가입하고 시작하세요</p>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-name">이름</label>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    className={styles.input}
                    placeholder="홍길동"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-username">아이디</label>
                  <input
                    id="reg-username"
                    type="text"
                    autoComplete="username"
                    className={styles.input}
                    placeholder="영문, 숫자 조합 4~20자"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-email">이메일</label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    className={styles.input}
                    placeholder="your@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-password">비밀번호</label>
                  <input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    className={styles.input}
                    placeholder="8자 이상"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reg-password-confirm">비밀번호 확인</label>
                  <input
                    id="reg-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    className={`${styles.input} ${
                      regPasswordConfirm && regPassword !== regPasswordConfirm ? styles.inputError : ""
                    }`}
                    placeholder="동일하게 입력하세요"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    required
                  />
                  {regPasswordConfirm && regPassword !== regPasswordConfirm && (
                    <span className={styles.fieldError}>비밀번호가 일치하지 않습니다</span>
                  )}
                </div>

                {error && (
                  <div className={styles.error} role="alert">
                    <span>⚠</span> {error}
                  </div>
                )}

                <button id="register-submit" type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : <span>회원가입</span>}
                </button>

                <p className={styles.switchText}>
                  이미 계정이 있으신가요?{" "}
                  <button type="button" className={styles.switchLink} onClick={() => { setTab("login"); setError(""); }}>
                    로그인하기
                  </button>
                </p>
              </form>
            )}
          </div>

          <p className={styles.guestLink}>
            <Link href="/order">로그인 없이 둘러보기 →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
