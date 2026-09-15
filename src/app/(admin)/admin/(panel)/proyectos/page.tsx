import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminProyectosPage() {
  await requireAdmin();

  return (
    <section>
      <h1>Proyectos</h1>
      <p>La administración de proyectos estará disponible próximamente.</p>
    </section>
  );
}
