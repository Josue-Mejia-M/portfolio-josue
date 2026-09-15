"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function logoutAdmin() {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    throw new Error("No se pudo cerrar la sesión.");
  }

  redirect("/admin/login");
}
