"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

type OrderItem = {
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type OrderRow = {
  id: number;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  payment_status: string | null;
  order_type: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

type OrderSummary = {
  totalOrders: number;
  totalSales: number;
  todaySales: number;
  todayOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  statusBreakdown: Array<{ status: OrderStatus; count: number }>;
};

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export default function AdminDashboard() {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const statusCountMap = useMemo(() => {
    const base: Record<string, number> = {};
    summary?.statusBreakdown?.forEach((row) => {
      base[row.status] = row.count;
    });
    return base;
  }, [summary]);

  async function fetchDashboardData(useLoading = false) {
    try {
      if (useLoading) setIsLoading(true);
      else setIsRefreshing(true);

      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const [summaryRes, ordersRes] = await Promise.all([
        fetch("/api/admin/orders/summary"),
        fetch(`/api/admin/orders?${params.toString()}`),
      ]);

      if (!summaryRes.ok || !ordersRes.ok) {
        throw new Error("대시보드 데이터를 불러오지 못했습니다.");
      }

      const summaryData = await summaryRes.json();
      const ordersData = await ordersRes.json();

      setSummary(summaryData);
      setOrders(Array.isArray(ordersData?.orders) ? ordersData.orders : []);
    } catch (error) {
      console.error(error);
      alert("주문 대시보드 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void fetchDashboardData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      void fetchDashboardData(false);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, search]);

  async function handleStatusChange(orderId: number, nextStatus: OrderStatus) {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message || "주문 상태 변경에 실패했습니다.");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: nextStatus } : order
        )
      );
      await fetchDashboardData(false);
    } catch (error: any) {
      alert(error?.message || "주문 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.topRow}>
        <h1 className={styles.title}>주문 대시보드</h1>
        <button
          className={styles.refreshButton}
          onClick={() => void fetchDashboardData(false)}
          disabled={isRefreshing}
        >
          {isRefreshing ? "새로고침 중..." : "새로고침"}
        </button>
      </section>

      <section className={styles.kpiGrid}>
        <KpiCard label="총 주문" value={summary?.totalOrders ?? 0} />
        <KpiCard label="오늘 주문" value={summary?.todayOrders ?? 0} />
        <KpiCard label="진행중 주문" value={summary?.activeOrders ?? 0} />
        <KpiCard label="오늘 매출" value={toWon(summary?.todaySales ?? 0)} />
      </section>

      <section className={styles.statusPanel}>
        <h2 className={styles.panelTitle}>상태별 주문 현황</h2>
        <div className={styles.statusChips}>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              className={[
                styles.statusChip,
                filterStatus === status ? styles.statusChipActive : "",
              ].join(" ")}
              onClick={() =>
                setFilterStatus((prev) => (prev === status ? "ALL" : status))
              }
            >
              <span>{status}</span>
              <strong>{statusCountMap[status] ?? 0}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.tablePanel}>
        <div className={styles.tableHeader}>
          <h2 className={styles.panelTitle}>주문 내역</h2>
          <div className={styles.filters}>
            <input
              className={styles.searchInput}
              placeholder="주문번호/고객명/전화번호 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={styles.statusFilter}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">전체 상태</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.empty}>주문 데이터를 불러오는 중입니다...</div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>조건에 맞는 주문이 없습니다.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>고객</th>
                  <th>주문항목</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>주문시간</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className={styles.orderNumber}>{order.order_number}</div>
                      <div className={styles.subText}>
                        {order.order_type || "-"} / {order.payment_status || "-"}
                      </div>
                    </td>
                    <td>
                      <div>{order.customer_name || "-"}</div>
                      <div className={styles.subText}>{order.customer_phone || "-"}</div>
                    </td>
                    <td>
                      {order.items?.length ? (
                        <ul className={styles.itemList}>
                          {order.items.slice(0, 3).map((item, index) => (
                            <li key={`${order.id}-${index}`}>
                              {item.menu_name} x{item.quantity}
                            </li>
                          ))}
                          {order.items.length > 3 && (
                            <li className={styles.subText}>+{order.items.length - 3}개 더</li>
                          )}
                        </ul>
                      ) : (
                        <span className={styles.subText}>항목 없음</span>
                      )}
                    </td>
                    <td>{toWon(order.total_amount)}</td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={order.status}
                        onChange={(e) =>
                          void handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        disabled={updatingId === order.id}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{label}</span>
      <strong className={styles.kpiValue}>{value}</strong>
    </article>
  );
}

function toWon(value: number) {
  return `${value.toLocaleString()}원`;
}

function formatDate(value: string) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return value;
  }
}
