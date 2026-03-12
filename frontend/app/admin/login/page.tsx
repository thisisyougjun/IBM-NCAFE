"use client";

import { useEffect, useState } from "react";
import { authAPI } from "@/app/lib/api";
import Link from "next/link";
import styles from "./page.module.css";

export default function LoginPage() {
  const [redirect, setRedirect] = useState("/admin");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setRedirect(sp.get("redirect") || "/admin");
    } catch {
      setRedirect("/admin");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login(username, password, "admin");
      if (!data) {
        setError("LOGIN FAILED.");
        return;
      }
      // Redirect to admin portal
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.message || "UNABLE TO CONNECT TO SERVER.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>ADMIN</h1>
          <p className={styles.formSubtitle}>MANAGEMENT PORTAL</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              USERNAME
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className={styles.input}
              placeholder="ENTER ADMIN ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={styles.input}
              placeholder="ENTER PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              <span>{error}</span>
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <span>SIGN IN</span>
            )}
          </button>
        </form>

        <div className={styles.backLink}>
          <Link href="/order">
            RETURN TO STORE
          </Link>
        </div>
      </div>
    </div>
  );
}
