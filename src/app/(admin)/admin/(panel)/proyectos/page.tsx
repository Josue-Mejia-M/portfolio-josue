import { listAdminProjects } from "@/features/projects/admin-queries";
import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

import styles from "./page.module.css";

/**
 * Superficie privada para consultar los proyectos almacenados. La autorización
 * se repite junto al acceso a datos, además de la protección del layout,
 * para que esta ruta no dependa únicamente de la composición visual.
 */
export default async function AdminProyectosPage() {
  await requireAdmin();
  const projects = await listAdminProjects();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h1>Proyectos</h1>
          <p>Consulta el estado y el orden de los proyectos del portafolio.</p>
        </div>
        {/* Navegación a la UI de alta; no modifica ningún proyecto existente. */}
        <Link className={styles.create} href="/admin/proyectos/nuevo">
          Crear proyecto
        </Link>
      </div>

      {/* La ausencia de filas es un estado válido, distinto de un error. */}
      {projects.length === 0 ? (
        <p className={styles.empty}>Todavía no hay proyectos registrados.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Publicación</th>
                <th scope="col">Destacado</th>
                <th scope="col">Estado</th>
                <th scope="col">Orden</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <th scope="row">{project.title}</th>
                  <td>{project.publication_status}</td>
                  <td>{project.is_featured ? "Sí" : "No"}</td>
                  <td>{project.development_status}</td>
                  <td>{project.display_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
