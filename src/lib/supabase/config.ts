/**
 * Configuración pública necesaria para crear clientes de Supabase. Se valida
 * al cargar el módulo para detectar despliegues incompletos antes de ejecutar
 * una operación de Auth o datos. Estas claves son públicas por diseño y no
 * sustituyen ninguna credencial administrativa.
 */
const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredSupabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!configuredSupabaseUrl?.trim()) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!configuredSupabasePublishableKey?.trim()) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export const supabaseUrl: string = configuredSupabaseUrl;
export const supabasePublishableKey: string = configuredSupabasePublishableKey;
