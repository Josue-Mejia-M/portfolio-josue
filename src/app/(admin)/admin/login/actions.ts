"use server";

import { isAuthError, isAuthRetryableFetchError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Estado serializable que la Server Action devuelve al formulario de acceso. */
export type AdminLoginState = {
  fieldErrors?: { email?: string; password?: string };
  message: string;
};

const denied = "No se pudo iniciar sesión. Revisa tus credenciales y permisos de acceso.";
const unavailable = "No se pudo conectar con el servicio de acceso. Inténtalo de nuevo más tarde.";
const cleanupFailed = "No se pudo completar el cierre de la sesión local. El acceso fue rechazado. Inténtalo de nuevo más tarde.";

/**
 * Convierte fallos de Auth o transporte en mensajes seguros para la interfaz.
 * No expone detalles de credenciales ni de la infraestructura remota.
 */
function errorMessage(error: unknown): string {
  if (isAuthError(error) && error.status === 429) {
    return "Demasiados intentos de acceso. Espera unos minutos antes de volver a intentarlo.";
  }
  if (isAuthRetryableFetchError(error) || !isAuthError(error) || (error.status ?? 0) >= 500) {
    return unavailable;
  }
  return denied;
}

/**
 * Valida credenciales, inicia sesión en Supabase y autoriza exclusivamente al
 * usuario con `app_metadata.role === "admin"`. Los errores de campo se devuelven
 * antes de llamar a Auth; los demás fallos se reducen a mensajes seguros.
 *
 * La contraseña se conserva literalmente porque puede contener espacios. Si
 * Auth autentica a un usuario que después no se verifica como administrador,
 * se cierra su sesión con alcance `local` para no dejar cookies utilizables en
 * este navegador. Una autorización correcta redirige sin retorno a `/admin`.
 *
 * @param _previousState Estado anterior requerido por `useActionState`; no se usa
 * para decidir identidad, rol ni destino.
 * @param formData Credenciales `email` y `password` enviadas por el formulario.
 * @returns Errores de validación o un mensaje seguro cuando no hay redirección.
 * @throws Redirección de Next.js a `/admin` tras autenticar y verificar al administrador.
 */
export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const emailValue = formData.get("email");
  const password = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const fieldErrors: NonNullable<AdminLoginState["fieldErrors"]> = {};

  if (!email) fieldErrors.email = "Introduce tu correo electrónico.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Introduce un correo electrónico válido.";
  }
  if (typeof password !== "string" || !password) {
    fieldErrors.password = "Introduce tu contraseña.";
  }
  if (Object.keys(fieldErrors).length || typeof password !== "string") {
    return { fieldErrors, message: "Revisa los campos indicados." };
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { message: errorMessage(error) };
  } catch (error) {
    return { message: errorMessage(error) };
  }

  let rejection: string | undefined;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) rejection = errorMessage(error);
    else if (!data.user || data.user.app_metadata.role !== "admin") rejection = denied;
  } catch (error) {
    rejection = errorMessage(error);
  }

  if (rejection) {
    // Incluso una verificación fallida debe revocar la sesión recién creada.
    // `local` evita afectar sesiones del usuario en otros dispositivos.
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) return { message: cleanupFailed };
    } catch {
      return { message: cleanupFailed };
    }
    return { message: rejection };
  }

  redirect("/admin");
}
