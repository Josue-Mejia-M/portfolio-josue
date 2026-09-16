import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Renueva la sesión de Supabase antes de que una solicitud administrativa
 * alcance la aplicación. La autorización por rol se realiza después, en
 * `requireAdmin`; este límite solo comprueba que exista una sesión.
 *
 * @param request Solicitud entrante cubierta por el `matcher`.
 * @returns La respuesta de continuación con cookies renovadas o una redirección al login.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Limita el coste y los efectos de renovación a `/admin` y sus rutas hijas.
  matcher: ["/admin/:path*"],
};
