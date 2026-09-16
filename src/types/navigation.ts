import type { LucideIcon } from "lucide-react";

/** Contrato de cada entrada del menú público y de las únicas rutas que puede declarar. */
export type NavigationItem = {
  label: string;
  href:
    | "/"
    | "/sobre-mi"
    | "/experiencia"
    | "/proyectos"
    | "/formacion"
    | "/contacto";
  icon: LucideIcon;
};
