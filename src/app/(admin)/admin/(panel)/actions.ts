"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Cierra la sesión local del administrador actual y lo devuelve al login.
 * Vuelve a autorizar la mutación: que el panel se haya renderizado antes no
 * autoriza una Server Action con una sesión ya expirada o distinta.
 *
 * @returns No retorna cuando el cierre es correcto, pues redirige al login.
 * @throws Redirección a `/admin/login` si `requireAdmin` rechaza la solicitud,
 * o un error si Supabase no pudo invalidar la sesión local.
 */
export async function logoutAdmin() {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    throw new Error("No se pudo cerrar la sesión.");
  }

  redirect("/admin/login");
}
