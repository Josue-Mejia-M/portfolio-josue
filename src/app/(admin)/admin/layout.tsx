import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Panel administrativo | Josué Mejía",
  description: "Panel administrativo del portafolio de Josué Mejía.",
  robots: { index: false, follow: false },
};

type AdminPanelLayoutProps = {
  children: ReactNode;
};

export default function AdminPanelLayout({ children }: AdminPanelLayoutProps) {
  return children;
}
