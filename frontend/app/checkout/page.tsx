"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { getCartItemOptionsKey, useCart } from "@/app/_components/CartProvider";
import { ArrowLeft } from "lucide-react";

type OrderType = "PICKUP" | "DELIVERY";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart, updateQuantity } = useCart();
  const [orderType, setOrderType] = useState<OrderType>("PICKUP");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = getTotalPrice();

  const canSubmit = useMemo(() => {
    if (items.length === 0) return false;
    if (!customerName.trim()) return false;
    if (!customerPhone.trim()) return false;
    if (orderType === "DELIVERY" && !address.trim()) return false;
    return true;
  }, [address, customerName, customerPhone, items.length, orderType]);

  async function handlePay() {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // 모의 결제: 실제 PG 연동 없이 완료 처리
      await new Promise((r) => setTimeout(r, 600));
      clearCart();
      alert("결제가 완료되었습니다. 주문이 접수되었습니다.");
      router.replace("/order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page + " fade-in"}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/order" className={styles.back}>
            <ArrowLeft size={16} />
            <span>BACK TO MENU</span>
          </Link>
          <div className={styles.brand}>
            <span>CHECKOUT</span>
          </div>
          <div className={styles.right} />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.formColumn}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>ORDER TYPE</h2>
            <div className={styles.orderTypeTabs}>
              <button
                type="button"
                className={[styles.tab, orderType === "PICKUP" ? styles.tabActive : ""].join(" ")}
                onClick={() => setOrderType("PICKUP")}
              >
                PICKUP
              </button>
              <button
                type="button"
                className={[styles.tab, orderType === "DELIVERY" ? styles.tabActive : ""].join(" ")}
                onClick={() => setOrderType("DELIVERY")}
              >
                DELIVERY
              </button>
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>CUSTOMER INFORMATION</h2>
            <div className={styles.form}>
              <label className={styles.field}>
                <span>NAME</span>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="ENTER YOUR NAME" />
              </label>
              <label className={styles.field}>
                <span>CONTACT</span>
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="010-0000-0000" />
              </label>
              {orderType === "DELIVERY" && (
                <label className={styles.field}>
                  <span>ADDRESS</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ENTER DELIVERY ADDRESS" />
                </label>
              )}
              <label className={styles.field}>
                <span>SPECIAL NOTES</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ANY SPECIAL REQUESTS?" rows={3} />
              </label>
            </div>
          </section>
        </div>

        <section className={[styles.panel, styles.summaryPanel].join(" ")}>
          <h2 className={styles.panelTitle}>ORDER SUMMARY</h2>

          {items.length === 0 ? (
            <div className={styles.empty}>
              <p>YOUR CART IS EMPTY</p>
              <Link href="/order" style={{ textDecoration: "underline" }}>
                BACK TO MENU
              </Link>
            </div>
          ) : (
            <div className={styles.summaryContent}>
              <ul className={styles.items}>
                {items.map((it) => {
                  const optionsKey = getCartItemOptionsKey(it.options);
                  const optionDelta = it.options?.reduce((sum, opt) => sum + opt.priceDelta, 0) ?? 0;
                  const unitPrice = it.price + optionDelta;
                  const itemTotal = unitPrice * it.quantity;

                  return (
                    <li key={it.menuId + ":" + optionsKey} className={styles.itemRow}>
                      <div className={styles.itemLeft}>
                        <div className={styles.itemName}>{it.korName}</div>
                        {it.options && it.options.length > 0 && (
                          <div className={styles.itemOptions}>
                            {it.options.map((o) => (
                              <span key={o.name + ":" + o.value}>
                                {o.name}: {o.value} {o.priceDelta ? "(+" + o.priceDelta.toLocaleString() + ") " : ""}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className={styles.itemMeta}>
                          {`${it.korName} | 단가: ${unitPrice.toLocaleString()} KRW | 수량: ${it.quantity} | 소계: ${itemTotal.toLocaleString()} KRW`}
                        </div>
                        <div className={styles.qtyControls}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(it.menuId, it.quantity - 1, optionsKey)}
                            aria-label={`${it.korName} quantity decrease`}
                          >
                            -
                          </button>
                          <span className={styles.qtyValue}>QTY {it.quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(it.menuId, Math.min(99, it.quantity + 1), optionsKey)}
                            aria-label={`${it.korName} quantity increase`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className={styles.summaryFooter}>
                <div className={styles.summaryRow}>
                  <span>TOTAL AMOUNT</span>
                  <strong>{totalPrice.toLocaleString()} KRW</strong>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <div className={styles.stickyPayBar}>
        <div className={styles.stickyPayInner}>
          <div className={styles.stickyPayTotal}>TOTAL {totalPrice.toLocaleString()} KRW</div>
          <button
            type="button"
            className={styles.payBtn}
            onClick={handlePay}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "PROCESSING..." : "PLACE ORDER"}
          </button>
        </div>
        {!canSubmit && (
          <p className={styles.hint}>
            {items.length === 0 ? "YOUR CART IS EMPTY" : "PLEASE FILL IN ALL REQUIRED FIELDS"}
          </p>
        )}
      </div>
    </div>
  );
}
