import styles from "./page.module.css";

/**
 * Fallback inmediato de App Router mientras la consulta privada se resuelve
 * en el servidor. `aria-busy` comunica el estado a tecnologías asistivas.
 */
export default function LoadingAdminProjects() {
  return (
    <section className={styles.section} aria-busy="true">
      <h1>Proyectos</h1>
      <p>Cargando proyectos…</p>
    </section>
  );
}
