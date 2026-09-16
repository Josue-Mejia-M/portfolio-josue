import type {
  DevelopmentStatus,
  ProjectType,
  PublicationStatus,
} from "@/types/project";
import {
  initialProjectFormValues,
  type ProjectFormFieldErrors,
  type ProjectFormValues,
} from "./form-state";

export type { ProjectFormFieldErrors, ProjectFormValues } from "./form-state";

/** Resultado discriminado de la validación pura, sin efectos de red o base de datos. */
export type ProjectValidationResult =
  | { success: true; values: ProjectFormValues }
  | { success: false; values: ProjectFormValues; fieldErrors: ProjectFormFieldErrors };

const projectTypes: readonly ProjectType[] = ["personal", "academic", "professional"];
const developmentStatuses: readonly DevelopmentStatus[] = ["in_progress", "completed", "paused"];
const publicationStatuses: readonly PublicationStatus[] = ["draft", "published"];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const integerPattern = /^(?:0|[1-9]\d*)$/;
const htmlPattern = /<[^>]*>/;

/**
 * Extrae un único campo textual y elimina espacios exteriores. Rechaza valores
 * repetidos o binarios para no aceptar cargas manipuladas fuera de la UI.
 */
function scalarValue(formData: FormData, name: Exclude<keyof ProjectFormValues, "technologies" | "is_featured">): string | null {
  const values = formData.getAll(name);
  if (values.length !== 1 || typeof values[0] !== "string") return null;
  return values[0].trim();
}

/** Comprueba un valor cerrado y conserva el tipo literal para TypeScript. */
function hasValue<T extends string>(values: readonly T[], value: string): value is T {
  return values.includes(value as T);
}

/** Aplica obligatoriedad, longitud y la restricción de texto plano compartida. */
function validateText(
  value: string,
  field: "title" | "description" | "learning",
  label: string,
  min: number,
  max: number,
  errors: ProjectFormFieldErrors,
) {
  if (!value) {
    errors[field] = field === "description"
      ? "La descripción es obligatorio."
      : `El ${label.toLowerCase()} es obligatorio.`;
  }
  else if (value.length < min || value.length > max) {
    errors[field] = `El ${label.toLowerCase()} debe tener entre ${min} y ${max} caracteres.`;
  } else if (htmlPattern.test(value)) {
    errors[field] = `El ${label.toLowerCase()} no puede contener HTML.`;
  }
}

/** Valida un enlace opcional sin corregir ni completar entradas inválidas. */
function validateOptionalHttpsUrl(
  value: string,
  field: "repository_url" | "live_url",
  errors: ProjectFormFieldErrors,
) {
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname || /\s/.test(value)) throw new Error("invalid URL");
  } catch {
    errors[field] = "Introduce una URL HTTPS válida.";
  }
}

/**
 * Valida y normaliza la carga no confiable del formulario de proyectos.
 * Las restricciones corresponden al diccionario de campos y a la migración
 * `20260901204447_create_projects.sql`. No consulta ni escribe en Supabase:
 * la Server Action la usa como fuente de verdad antes de una futura creación.
 *
 * @param formData Datos no confiables recibidos desde el navegador o una POST directa.
 * @returns Valores normalizados y, si corresponde, errores asociados a cada campo.
 */
export function validateProjectForm(formData: FormData): ProjectValidationResult {
  const errors: ProjectFormFieldErrors = {};
  const values: ProjectFormValues = { ...initialProjectFormValues };

  for (const name of ["title", "slug", "description", "project_type", "development_status", "learning", "repository_url", "live_url", "publication_status", "display_order"] as const) {
    const value = scalarValue(formData, name);
    if (value === null) {
      errors[name] = "El valor enviado no es válido.";
    } else {
      values[name] = value;
    }
  }

  const technologyEntries = formData.getAll("technologies");
  if (technologyEntries.some((technology) => typeof technology !== "string")) {
    errors.technologies = "Las tecnologías enviadas no son válidas.";
  } else {
    values.technologies = (technologyEntries as string[]).map((technology) => technology.trim());
  }

  const featuredEntries = formData.getAll("is_featured");
  if (featuredEntries.length === 0) values.is_featured = false;
  else if (featuredEntries.length === 1 && featuredEntries[0] === "on") values.is_featured = true;
  else errors.is_featured = "El valor de proyecto destacado no es válido.";

  validateText(values.title, "title", "Título", 3, 80, errors);
  if (!values.slug) errors.slug = "El slug es obligatorio.";
  else if (values.slug.length < 3 || values.slug.length > 100 || !slugPattern.test(values.slug)) {
    errors.slug = "El slug debe tener de 3 a 100 caracteres con minúsculas, números y guiones.";
  }
  validateText(values.description, "description", "Descripción", 40, 300, errors);
  validateText(values.learning, "learning", "Aprendizaje", 30, 600, errors);

  if (!hasValue(projectTypes, values.project_type)) errors.project_type = "Selecciona un tipo de proyecto válido.";
  if (!hasValue(developmentStatuses, values.development_status)) errors.development_status = "Selecciona un estado de desarrollo válido.";
  if (!hasValue(publicationStatuses, values.publication_status)) errors.publication_status = "Selecciona un estado de publicación válido.";

  if (!integerPattern.test(values.display_order) || Number(values.display_order) > 2_147_483_647) {
    errors.display_order = "El orden debe ser un número entero igual o mayor que 0.";
  }

  validateOptionalHttpsUrl(values.repository_url, "repository_url", errors);
  validateOptionalHttpsUrl(values.live_url, "live_url", errors);

  const duplicateTechnology = new Set<string>();
  for (const technology of values.technologies) {
    const normalized = technology.toLocaleLowerCase();
    if (!technology || technology.length > 30) {
      errors.technologies = "Cada tecnología debe tener entre 1 y 30 caracteres.";
      break;
    }
    if (duplicateTechnology.has(normalized)) {
      errors.technologies = "No repitas tecnologías en la lista.";
      break;
    }
    duplicateTechnology.add(normalized);
  }
  if (values.technologies.length > 12) errors.technologies = "Puedes añadir un máximo de 12 tecnologías.";

  if (values.is_featured && values.publication_status !== "published") {
    errors.is_featured = "Un proyecto destacado debe estar publicado.";
  }
  if (values.publication_status === "published") {
    if (values.technologies.length < 1 && !errors.technologies) {
      errors.technologies = "Añade entre 1 y 12 tecnologías para publicar.";
    }
    // Las rutas aún no son campos editables: no se inventan entradas ni Storage.
    errors.publication_status = "Aún no puedes publicar: faltan las capturas requeridas.";
  }

  return Object.keys(errors).length
    ? { success: false, values, fieldErrors: errors }
    : { success: true, values };
}
