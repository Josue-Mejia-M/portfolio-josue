import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin/AdminShell/AdminShell";
import { requireAdmin } from "@/lib/supabase/admin";

/**
 * Frontera de servidor del panel autenticado. Autoriza el render compartido;
 * las páginas y Server Actions siguen verificando operaciones sensibles cerca
 * de su ejecución.
 */
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
