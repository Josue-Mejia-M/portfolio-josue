import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { supabasePublishableKey, supabaseUrl } from "./config";

/**
 * Crea un cliente SSR tipado y vinculado a las cookies de la solicitud actual.
 * `server-only` impide importarlo en el navegador. En un Server Component las
 * cookies no pueden escribirse; el `catch` conserva el render y delega la
 * renovación persistente a `proxy.ts`, que se ejecuta antes en rutas admin.
 *
 * @returns Cliente de Supabase asociado al almacén de cookies actual.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Los Server Components no escriben cookies. `proxy.ts` renueva la
          // sesión antes del render y persiste las cookies resultantes.
        }
      },
    },
  });
}
