import {
  BriefcaseBusiness,
  FolderKanban,
  GraduationCap,
  House,
  Mail,
  UserRound,
} from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const navigationItems: NavigationItem[] = [
  { label: "Inicio", href: "/", icon: House },
  { label: "Sobre mí", href: "/sobre-mi", icon: UserRound },
  {
    label: "Experiencia",
    href: "/experiencia",
    icon: BriefcaseBusiness,
  },
  { label: "Proyectos", href: "/proyectos", icon: FolderKanban },
  { label: "Formación", href: "/formacion", icon: GraduationCap },
  { label: "Contacto", href: "/contacto", icon: Mail },
];
