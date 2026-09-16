import type { Database } from "./database";

/** Fila leída desde `projects`, derivada del contrato de base de datos. */
export type Project = Database["public"]["Tables"]["projects"]["Row"];

/** Datos aceptados al insertar un proyecto; respeta valores opcionales de SQL. */
export type ProjectInsert =
  Database["public"]["Tables"]["projects"]["Insert"];

/** Cambios parciales aceptados al actualizar un proyecto existente. */
export type ProjectUpdate =
  Database["public"]["Tables"]["projects"]["Update"];

export type {
  DevelopmentStatus,
  ProjectType,
  PublicationStatus,
} from "./database";
