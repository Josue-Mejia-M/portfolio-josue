import { CircleCheck } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <section className={styles.page}>
      <div className={styles.checkCard}>
        <span className={styles.status}>
          <CircleCheck aria-hidden="true" size={18} strokeWidth={2} />
          Base técnica lista
        </span>
        <h1>Portafolio de Josué Mejía</h1>
        <p>
          Next.js, las tipografías, las variables de color y CSS Modules están
          configurados correctamente.
        </p>
      </div>
    </section>
  );
}
