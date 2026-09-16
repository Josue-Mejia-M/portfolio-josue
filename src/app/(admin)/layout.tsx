import type { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

/**
 * Delimita el grupo de rutas administrativas sin añadir interfaz compartida.
 * Mantiene separado el ámbito de login del shell protegido y de sus metadatos.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return children;
}
