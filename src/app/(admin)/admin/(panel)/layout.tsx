import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin/AdminShell/AdminShell";

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
