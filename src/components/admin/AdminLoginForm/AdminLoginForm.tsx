"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { unstable_rethrow } from "next/navigation";
import { loginAdmin, type AdminLoginState } from "@/app/(admin)/admin/login/actions";
import styles from "./AdminLoginForm.module.css";

type FieldErrors = { email?: string; password?: string };
export function AdminLoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const submissionLock = useRef(false);
  const [state, submitAction, isSubmitting] = useActionState<AdminLoginState, FormData>(
    async (previousState, formData) => {
      try {
        const result = await loginAdmin(previousState, formData);
        setErrors(result.fieldErrors ?? {});
        return result;
      } catch (error) {
        unstable_rethrow(error);
        return { message: "No se pudo completar la solicitud. Comprueba tu conexión e inténtalo de nuevo." };
      } finally {
        submissionLock.current = false;
      }
    },
    { message: "" },
  );

  useEffect(() => {
    if (isSubmitting) return;
    if (state.fieldErrors?.email) emailRef.current?.focus();
    else if (state.fieldErrors?.password) passwordRef.current?.focus();
  }, [state, isSubmitting]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || submissionLock.current) return;

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
    if (nextErrors.email) {
      email.focus();
    } else if (nextErrors.password) {
      password.focus();
    } else {
      // Capture values before disabling inputs; keep the password unchanged.
      const formData = new FormData(event.currentTarget);
      submissionLock.current = true;
      startTransition(() => submitAction(formData));
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
      <div className={styles.field}>
        <label htmlFor="admin-email">Correo electrónico</label>
        <input
          ref={emailRef}
          id="admin-email"
          name="email"
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
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "admin-password-error" : undefined}
        />
        <p id="admin-password-error" className={styles.error} aria-live="polite">{errors.password}</p>
      </div>
      <p className={styles.error} role="alert" aria-atomic="true">{isSubmitting ? "" : state.message}</p>
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
