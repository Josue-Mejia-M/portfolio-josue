import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

/** Compone el marco visual exclusivo del portafolio público y su navegación. */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
