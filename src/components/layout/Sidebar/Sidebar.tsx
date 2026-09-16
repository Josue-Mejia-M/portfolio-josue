"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";
import { navigationItems } from "@/data/navigation";
import styles from "./Sidebar.module.css";

/**
 * Navegación cliente del portafolio. Marca activo únicamente el enlace cuyo
 * `href` coincide exactamente con la ruta actual, evitando activar secciones
 * hermanas por coincidencias de prefijo.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.identity}>
        <div className={styles.avatar} aria-hidden="true">
          JM
        </div>
        <div>
          <p className={styles.name}>Josué Mejía</p>
          <p className={styles.role}>
            Aspirante a desarrollador Full Stack Junior
          </p>
        </div>
      </div>

      <nav className={styles.navigation} aria-label="Navegación principal">
        <ul className={styles.list}>
          {navigationItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <li key={href}>
                <Link
                  className={`${styles.link} ${isActive ? styles.active : ""}`}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.themeControl}>
        <ThemeToggle />
      </div>
    </aside>
  );
}
