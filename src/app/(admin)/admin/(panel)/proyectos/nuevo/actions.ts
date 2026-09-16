"use server";

// Este módulo exporta exclusivamente Server Actions async; el estado compartido
// está en `@/features/projects/form-state` para que el cliente pueda importarlo.
import { validateProjectForm } from "@/features/projects/validation";
import type { ValidateProjectState } from "@/features/projects/form-state";
import { requireAdmin } from "@/lib/supabase/admin";

/**
 * Reautoriza y valida un intento de alta sin persistirlo. La creación en
 * Supabase queda expresamente fuera de esta tarea. `requireAdmin` se ejecuta
 * aquí —además de la protección de ruta— porque una Server Action es invocable
 * mediante una petición POST directa.
 *
 * @param _previousState Estado anterior exigido por React; no decide permisos ni datos.
 * @param formData Valores no confiables enviados por el formulario.
 * @returns Errores por campo o la confirmación de validación, siempre sin persistir.
 * @throws Redirección a `/admin/login` cuando la solicitud no pertenece a un administrador.
 */
export async function validateNewProject(
  _previousState: ValidateProjectState,
  formData: FormData,
): Promise<ValidateProjectState> {
  await requireAdmin();

  const result = validateProjectForm(formData);
  if (!result.success) {
    return {
      success: false,
      message: "Revisa los campos indicados.",
      values: result.values,
      fieldErrors: result.fieldErrors,
    };
  }

  return {
    success: true,
    message: "Los datos son válidos. Aún no se ha creado ningún proyecto.",
    values: result.values,
  };
}
