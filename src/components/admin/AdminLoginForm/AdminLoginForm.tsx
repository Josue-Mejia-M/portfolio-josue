"use client";

import { useRef, useState, type FormEvent } from "react";
import styles from "./AdminLoginForm.module.css";

type FieldErrors = { email?: string; password?: string };
type AdminLoginFormProps = {
  isSubmitting?: boolean;
  generalError?: string;
};

export function AdminLoginForm({
  isSubmitting = false,
  generalError = "",
}: AdminLoginFormProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const email = emailRef.current!;
    const password = passwordRef.current!;
    const nextErrors: FieldErrors = {};

    if (!email.value.trim()) {
      nextErrors.email = "Introduce tu correo electrónico.";
    } else if (email.validity.typeMismatch) {
      nextErrors.email = "Introduce un correo electrónico válido.";
    }
    if (!password.value) {
      nextErrors.password = "Introduce tu contraseña.";
    }

    setErrors(nextErrors);
    setMessage("");
    if (nextErrors.email) {
      email.focus();
    } else if (nextErrors.password) {
      password.focus();
    } else {
      setMessage("El inicio de sesión estará disponible próximamente.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
      <div className={styles.field}>
        <label htmlFor="admin-email">Correo electrónico</label>
        <input
          ref={emailRef}
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "admin-email-error" : undefined}
        />
        <p id="admin-email-error" className={styles.error} aria-live="polite">{errors.email}</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="admin-password">Contraseña</label>
        <input
          ref={passwordRef}
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "admin-password-error" : undefined}
        />
        <p id="admin-password-error" className={styles.error} aria-live="polite">{errors.password}</p>
      </div>
      <p className={styles.error} role="alert" aria-atomic="true">{generalError}</p>
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
      <p className={styles.message} role="status" aria-atomic="true">{message}</p>
    </form>
  );
}
