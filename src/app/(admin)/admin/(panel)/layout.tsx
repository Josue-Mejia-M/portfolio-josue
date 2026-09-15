import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin/AdminShell/AdminShell";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
