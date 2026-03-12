"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";
import AdminHeader from "./_components/AdminHeader";
import AdminFooter from "./_components/AdminFooter";
import AdminAuthGuard from "./_components/AdminAuthGuard";
import styles from "./layout.module.css";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const isLoginRoute = pathname?.startsWith("/admin/login");

  if (isLoginRoute) return <>{children}</>;

  return (
    <AdminAuthGuard>
      <div className={styles.layout}>
        <AdminSidebar />
        <div className={styles.pageWrapper}>
          <AdminHeader />
          <div className={styles.content}>{children}</div>
          <AdminFooter />
        </div>
      </div>
    </AdminAuthGuard>
  );
}
