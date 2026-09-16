import { ProjectCreateForm } from "@/components/admin/ProjectCreateForm/ProjectCreateForm";
import { requireAdmin } from "@/lib/supabase/admin";

/**
 * Ruta privada del formulario. Mantiene la autorización cerca de la ruta y
 * delega únicamente la interacción local al componente cliente.
 */
export default async function AdminNuevoProyectoPage() {
  await requireAdmin();

  return (
    <section>
      <h1>Crear proyecto</h1>
      <p>Completa la información del proyecto. El guardado se habilitará en una tarea posterior.</p>
      <ProjectCreateForm />
    </section>
  );
}
