import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm/AdminLoginForm";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  return (
    <main className={styles.main}>
      <section className={styles.card} aria-labelledby="login-title">
        <h1 id="login-title" className={styles.title}>Iniciar sesión</h1>
        <p className={styles.description}>Acceso administrativo al portafolio.</p>
        <AdminLoginForm />
        <Link className={styles.back} href="/">Volver al portafolio</Link>
      </section>
    </main>
  );
}
