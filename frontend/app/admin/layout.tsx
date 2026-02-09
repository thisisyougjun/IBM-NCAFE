"use client";

import { ReactNode } from "react";
import AdminSidebar from "./_components/AdminSidebar";
import AdminHeader from "./_components/AdminHeader";
import AdminFooter from "./_components/AdminFooter";
import styles from "./layout.module.css";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.pageWrapper}>
        <AdminHeader />
        <div className={styles.content}>{children}</div>
        <AdminFooter />
      </div>
    </div>
  );
}
