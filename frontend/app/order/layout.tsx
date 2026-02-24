import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NCAFE | 메뉴 주문",
  description: "IBM NCAFE - 신선한 커피와 디저트를 만나보세요",
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
