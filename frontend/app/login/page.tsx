"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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

  // 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authAPI.login(formData.username, formData.password);
      if (!data) {
        setError("LOGIN FAILED.");
        return;
      }
      window.dispatchEvent(new Event("login"));
      window.location.href = redirect || "/order";
    } catch (err: any) {
      setError(err.message || "UNABLE TO CONNECT TO SERVER.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.passwordConfirm) {
      setError("PASSWORDS DO NOT MATCH.");
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.register(formData.name, formData.username, formData.email, formData.password);
      if (!data) {
        setError("REGISTRATION FAILED.");
        return;
      }
      window.dispatchEvent(new Event("login"));
      window.location.href = redirect || "/order";
    } catch (err: any) {
      setError(err.message || "UNABLE TO CONNECT TO SERVER.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.formCard}>
        {/* TABS */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "login" ? styles.tabActive : ""}`}
            onClick={() => { setTab("login"); setError(""); }}
          >
            LOGIN
          </button>
          <button
            className={`${styles.tab} ${tab === "register" ? styles.tabActive : ""}`}
            onClick={() => { setTab("register"); setError(""); }}
          >
            REGISTER
          </button>
        </div>

        <div className={styles.form}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>
              {tab === "login" ? "WELCOME BACK" : "JOIN US"}
            </h1>
            <p className={styles.formSubtitle}>
              {tab === "login" ? "SIGN IN TO YOUR ACCOUNT" : "CREATE YOUR NCAFE ACCOUNT"}
            </p>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              <span>{error}</span>
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className={styles.field}>
                <label className={styles.label}>USERNAME</label>
                <input
                  type="text"
                  name="username"
                  className={styles.input}
                  placeholder="ID"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>PASSWORD</label>
                <input
                  type="password"
                  name="password"
                  className={styles.input}
                  placeholder="PASSWORD"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "AUTHENTICATING..." : "SIGN IN"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className={styles.field}>
                <label className={styles.label}>FULL NAME</label>
                <input
                  type="text"
                  name="name"
                  className={styles.input}
                  placeholder="NAME"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>USERNAME</label>
                <input
                  type="text"
                  name="username"
                  className={styles.input}
                  placeholder="ID"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>EMAIL</label>
                <input
                  type="email"
                  name="email"
                  className={styles.input}
                  placeholder="EMAIL"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>PASSWORD</label>
                <input
                  type="password"
                  name="password"
                  className={styles.input}
                  placeholder="PASSWORD"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  name="passwordConfirm"
                  className={styles.input}
                  placeholder="CONFIRM"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "CREATING..." : "SIGN UP"}
              </button>
            </form>
          )}

          <p className={styles.switchText}>
            {tab === "login" ? "NEW TO NCAFE?" : "ALREADY A MEMBER?"}
            <button
              type="button"
              className={styles.switchLink}
              onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}
            >
              {tab === "login" ? "REGISTER" : "LOGIN"}
            </button>
          </p>
        </div>

        <div className={styles.guestLink}>
          <Link href="/order">
            CONTINUE AS GUEST
          </Link>
        </div>
      </div>
    </div>
  );
}
