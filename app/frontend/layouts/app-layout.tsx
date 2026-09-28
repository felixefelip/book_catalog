import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
  );
}
