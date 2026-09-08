"use server";

import { isAuthError, isAuthRetryableFetchError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminLoginState = {
  fieldErrors?: { email?: string; password?: string };
  message: string;
};

const denied = "No se pudo iniciar sesión. Revisa tus credenciales y permisos de acceso.";
const unavailable = "No se pudo conectar con el servicio de acceso. Inténtalo de nuevo más tarde.";
const cleanupFailed = "No se pudo completar el cierre de la sesión local. El acceso fue rechazado. Inténtalo de nuevo más tarde.";

function errorMessage(error: unknown): string {
  if (isAuthError(error) && error.status === 429) {
    return "Demasiados intentos de acceso. Espera unos minutos antes de volver a intentarlo.";
  }
  if (isAuthRetryableFetchError(error) || !isAuthError(error) || (error.status ?? 0) >= 500) {
    return unavailable;
  }
  return denied;
}

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
    // Also clean up when the newly authenticated user cannot be verified.
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
