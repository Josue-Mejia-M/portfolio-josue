import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

import { supabasePublishableKey, supabaseUrl } from "./config";

/**
 * Sincroniza la sesión SSR de Supabase con la solicitud y la respuesta antes
 * de renderizar una ruta administrativa. No determina si el usuario posee el
 * rol `admin`; esa autorización corresponde a `requireAdmin` y a las RLS.
 *
 * `getAll` entrega a Supabase las cookies recibidas. Cuando Supabase las
 * renueva, `setAll` actualiza tanto la solicitud en curso como la respuesta
 * saliente para que el render y la siguiente navegación observen la sesión.
 *
 * @param request Solicitud de Next.js interceptada por `proxy.ts`.
 * @returns Una respuesta de continuación con la sesión actualizada, o una
 * redirección a `/admin/login` si no hay claims para una ruta protegida.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          supabaseResponse.headers.set(name, value);
        });
      },
    },
  });

  // Debe ejecutarse inmediatamente: Supabase puede renovar una sesión próxima
  // a expirar y `setAll` debe propagar esas cookies antes del renderizado.
  const { data } = await supabase.auth.getClaims();

  if (request.nextUrl.pathname !== "/admin/login" && !data?.claims) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    // No se conserva una query arbitraria al entrar al login.
    loginUrl.search = "";

    const response = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    supabaseResponse.headers.forEach((value, name) => response.headers.set(name, value));
    return response;
  }

  return supabaseResponse;
}
