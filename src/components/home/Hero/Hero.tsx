import Link from "next/link";
import { ArrowRight, Code2, Download, Server } from "lucide-react";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.content}>
        <p className={styles.eyebrow}>
          EGRESADO DE INGENIERÍA EN SISTEMAS · FULL STACK JR
        </p>

        <div className={styles.introduction}>
          <p className={styles.greeting}>Hola, soy</p>
          <h1 id="hero-title" className={styles.title}>
            Josué Nicolas Mejia Marquez.
          </h1>
        </div>

        <p className={styles.statement}>
          Del <span>navegador</span> al <span>servidor</span>, estoy construyendo
          mi camino en el desarrollo <span>Full Stack</span>.
        </p>

        <p className={styles.description}>
          Me interesa crear aplicaciones web funcionales, organizadas y fáciles
          de utilizar. Con cada proyecto continúo fortaleciendo mis habilidades
          de frontend y backend, convirtiendo la práctica y el aprendizaje en
          experiencia.
        </p>

        <div className={styles.actions}>
          <Link className={`${styles.button} ${styles.primary}`} href="/proyectos">
            Ver proyectos
            <ArrowRight aria-hidden="true" size={19} strokeWidth={2} />
          </Link>
          <a
            className={`${styles.button} ${styles.secondary}`}
            href="/documents/CV_Josue_Mejia.pdf"
            download
          >
            <Download aria-hidden="true" size={19} strokeWidth={2} />
            Descargar CV
          </a>
        </div>
      </div>

      <div className={styles.visualColumn} aria-hidden="true">
        <div className={styles.visual}>
          <div className={styles.visualGrid} />
          <div className={`${styles.techBadge} ${styles.frontendBadge}`}>
            <Code2 size={18} strokeWidth={1.8} />
            <span>Frontend</span>
          </div>
          <div className={styles.monogram}>JM</div>
          <div className={`${styles.techBadge} ${styles.backendBadge}`}>
            <Server size={18} strokeWidth={1.8} />
            <span>Backend</span>
          </div>
          <span className={`${styles.detailDot} ${styles.detailDotTop}`} />
          <span className={`${styles.detailDot} ${styles.detailDotBottom}`} />
        </div>
      </div>
    </section>
  );
}
