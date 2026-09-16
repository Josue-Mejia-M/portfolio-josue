import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types/project";

/**
 * Datos mínimos que necesita el listado privado de proyectos. Evita que la
 * interfaz administrativa reciba columnas que no muestra en esta tarea.
 */
export type AdminProjectListItem = Pick<
  Project,
  | "id"
  | "title"
  | "publication_status"
  | "is_featured"
  | "development_status"
  | "display_order"
>;

/**
 * Obtiene los proyectos visibles para el administrador de la solicitud actual.
 * La ruta protegida autoriza antes de invocarla y RLS conserva la defensa de
 * datos por rol. El orden secundario y terciario hacen estable el resultado
 * cuando varios proyectos comparten el mismo `display_order`.
 */
export async function listAdminProjects(): Promise<AdminProjectListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, publication_status, is_featured, development_status, display_order",
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) {
    // El detalle de Supabase se conserva en los registros del servidor y no
    // se serializa hacia la interfaz administrativa.
    throw new Error("No se pudieron cargar los proyectos administrativos.");
  }

  return data;
}
