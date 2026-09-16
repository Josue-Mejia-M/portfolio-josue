"use client";

import styles from "./page.module.css";

/** Contrato que Next.js entrega al límite de error de este segmento. */
type AdminProjectsErrorProps = {
  retry: () => void;
};

/**
 * Límite cliente para errores inesperados de carga. No muestra el detalle del
 * error del servidor, que podría contener información interna, y permite que
 * Next vuelva a solicitar y renderizar el segmento mediante `retry`.
 */
export default function AdminProjectsError({ retry }: AdminProjectsErrorProps) {
  return (
    <section className={styles.section} role="alert">
      <h1>No se pudieron cargar los proyectos</h1>
      <p>Inténtalo de nuevo en unos momentos.</p>
      <button className={styles.retry} type="button" onClick={retry}>
        Reintentar
      </button>
    </section>
  );
}
