import type { LucideIcon } from "lucide-react";

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
