import { Suspense } from "react";
import { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
