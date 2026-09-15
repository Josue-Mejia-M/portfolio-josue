import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <section>
      <h1>Bienvenido al panel administrativo</h1>
      <p>Este es el espacio de administración de tu portafolio.</p>
    </section>
  );
}
