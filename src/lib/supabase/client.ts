"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { supabasePublishableKey, supabaseUrl } from "./config";

/**
 * Crea el cliente tipado para componentes y eventos del navegador. No debe
 * importarse desde código de servidor: la variante SSR administra cookies por
 * solicitud en `./server`.
 *
 * @returns Cliente de Supabase configurado para el entorno del navegador.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
