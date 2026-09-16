import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "./server";

/**
 * Autoriza la solicitud actual únicamente cuando Supabase devuelve un usuario
 * cuyo `app_metadata.role` es exactamente `"admin"`.
 *
 * La redirección no retorna: sesiones ausentes, inválidas y cualquier otro rol
 * terminan en `/admin/login`. `cache` memoriza el resultado durante el render
 * actual para no repetir la consulta, pero no sustituye RLS ni la verificación
 * junto a cada mutación o acceso administrativo a datos.
 *
 * @returns El usuario autenticado y verificado como administrador.
 * @throws Redirección de Next.js a `/admin/login` si no se autoriza la solicitud.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  let result: Awaited<ReturnType<typeof supabase.auth.getUser>>;

  try {
    result = await supabase.auth.getUser();
  } catch {
    redirect("/admin/login");
  }

  if (
    result.error ||
    !result.data.user ||
    result.data.user.app_metadata.role !== "admin"
  ) {
    redirect("/admin/login");
  }

  return result.data.user;
});
