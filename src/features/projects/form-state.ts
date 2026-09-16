/**
 * Contratos serializables compartidos por el formulario cliente y la respuesta
 * de validación. Debe mantenerse fuera de módulos con `"use server"`: Next.js
 * solo permite que dichos módulos exporten Server Actions asíncronas.
 */

/** Valores serializables que el formulario conserva entre intentos de envío. */
export type ProjectFormValues = {
  title: string;
  slug: string;
  description: string;
  project_type: string;
  development_status: string;
  learning: string;
  technologies: string[];
  repository_url: string;
  live_url: string;
  publication_status: string;
  display_order: string;
  is_featured: boolean;
};

/** Mensajes de validación indexados por el `name` de cada control HTML. */
export type ProjectFormFieldErrors = Partial<Record<keyof ProjectFormValues, string>>;

/** Estado inicial compartible por el formulario cliente y la respuesta servidor. */
export const initialProjectFormValues: ProjectFormValues = {
  title: "",
  slug: "",
  description: "",
  project_type: "",
  development_status: "",
  learning: "",
  technologies: [],
  repository_url: "",
  live_url: "",
  publication_status: "draft",
  display_order: "0",
  is_featured: false,
};

export type ValidateProjectState = {
  success: boolean;
  message: string;
  values: ProjectFormValues;
  fieldErrors?: ProjectFormFieldErrors;
};

/** Estado inicial de `useActionState`; no se exporta desde un módulo `use server`. */
export const initialValidateProjectState: ValidateProjectState = {
  success: false,
  message: "",
  values: initialProjectFormValues,
};
