import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell/AppShell";

type PublicLayoutProps = {
  children: ReactNode;
};

/** Agrupa las rutas públicas bajo su shell, sin afectar la URL final. */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
