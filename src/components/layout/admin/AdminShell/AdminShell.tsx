import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderKanban, House, LogOut } from "lucide-react";
import styles from "./AdminShell.module.css";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.name}>Panel administrativo</p>
          <div className={styles.actions}>
            <Link className={styles.link} href="/">
              Ver portafolio
              <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.8} />
            </Link>
            <button className={styles.logout} type="button" disabled>
              <LogOut aria-hidden="true" size={20} strokeWidth={1.8} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <div className={styles.body}>
        <nav className={styles.navigation} aria-label="Navegación administrativa">
          <ul className={styles.list}>
            <li>
              <Link className={styles.link} href="/admin">
                <House aria-hidden="true" size={20} strokeWidth={1.8} />
                Inicio
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/admin/proyectos">
                <FolderKanban aria-hidden="true" size={20} strokeWidth={1.8} />
                Proyectos
              </Link>
            </li>
          </ul>
        </nav>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
