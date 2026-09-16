"use client";

import { useActionState, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { validateNewProject } from "@/app/(admin)/admin/(panel)/proyectos/nuevo/actions";
// Estado sin `use server`: es seguro compartirlo con este Client Component.
import { initialProjectFormValues, initialValidateProjectState, type ProjectFormValues } from "@/features/projects/form-state";
import styles from "./ProjectCreateForm.module.css";

const technologySeparators = new Set(["Enter", ","]);
const fieldsInOrder: (keyof ProjectFormValues)[] = ["title", "slug", "project_type", "development_status", "description", "learning", "technologies", "repository_url", "live_url", "publication_status", "display_order", "is_featured"];

/**
 * Coordina los chips de tecnologías y la Server Action de validación. Mantiene
 * los controles como estado local controlado para aplicar los valores
 * normalizados que retorna el servidor y no perder datos al mostrar errores.
 */
export function ProjectCreateForm() {
  const [state, submitAction, isSubmitting] = useActionState(validateNewProject, initialValidateProjectState);
  const [values, setValues] = useState<ProjectFormValues>(initialProjectFormValues);
  const [technologyInput, setTechnologyInput] = useState("");
  const submitted = useRef(false);

  useEffect(() => {
    if (!submitted.current || isSubmitting) return;
    setValues(state.values);
    submitted.current = false;
    const field = fieldsInOrder.find((name) => state.fieldErrors?.[name]);
    if (field) document.getElementById(field)?.focus();
  }, [isSubmitting, state]);

  function changeValue(name: Exclude<keyof ProjectFormValues, "technologies" | "is_featured">, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }
  function addTechnology() {
    const technology = technologyInput.trim();
    if (!technology) return;
    setValues((current) => ({ ...current, technologies: [...current.technologies, technology] }));
    setTechnologyInput("");
  }
  function handleTechnologyKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!technologySeparators.has(event.key)) return;
    event.preventDefault();
    addTechnology();
  }
  function removeTechnology(index: number) {
    setValues((current) => ({ ...current, technologies: current.technologies.filter((_, itemIndex) => itemIndex !== index) }));
  }
  const error = (name: keyof ProjectFormValues) => state.fieldErrors?.[name];
  const describedBy = (name: keyof ProjectFormValues, extra?: string) => [extra, error(name) ? `${name}-error` : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <form className={styles.form} action={(formData) => { submitted.current = true; submitAction(formData); }} noValidate aria-busy={isSubmitting}>
      <fieldset className={styles.section} disabled={isSubmitting}>
        <legend>Información general</legend><div className={styles.grid}>
          <FieldError name="title" error={error("title")} className={styles.error}><label htmlFor="title">Título</label><input id="title" name="title" type="text" value={values.title} onChange={(e) => changeValue("title", e.target.value)} placeholder="Ej. Página web para una cafetería" autoComplete="off" aria-invalid={Boolean(error("title"))} aria-describedby={describedBy("title")} /></FieldError>
          <FieldError name="slug" error={error("slug")} className={styles.error}><label htmlFor="slug">Slug</label><input id="slug" name="slug" type="text" value={values.slug} onChange={(e) => changeValue("slug", e.target.value)} placeholder="Ej. pagina-web-cafeteria" autoComplete="off" aria-invalid={Boolean(error("slug"))} aria-describedby={describedBy("slug")} /></FieldError>
          <FieldError name="project_type" error={error("project_type")} className={styles.error}><label htmlFor="project_type">Tipo de proyecto</label><select id="project_type" name="project_type" value={values.project_type} onChange={(e) => changeValue("project_type", e.target.value)} aria-invalid={Boolean(error("project_type"))} aria-describedby={describedBy("project_type")}><option value="" disabled>Selecciona un tipo</option><option value="personal">Proyecto personal</option><option value="academic">Proyecto académico</option><option value="professional">Proyecto profesional</option></select></FieldError>
          <FieldError name="development_status" error={error("development_status")} className={styles.error}><label htmlFor="development_status">Estado de desarrollo</label><select id="development_status" name="development_status" value={values.development_status} onChange={(e) => changeValue("development_status", e.target.value)} aria-invalid={Boolean(error("development_status"))} aria-describedby={describedBy("development_status")}><option value="" disabled>Selecciona un estado</option><option value="in_progress">En desarrollo</option><option value="completed">Finalizado</option><option value="paused">Pausado</option></select></FieldError>
        </div>
      </fieldset>
      <fieldset className={styles.section} disabled={isSubmitting}><legend>Descripción y aprendizaje</legend>
        <FieldError name="description" error={error("description")} className={styles.error}><label htmlFor="description">Descripción</label><textarea id="description" name="description" rows={5} value={values.description} onChange={(e) => changeValue("description", e.target.value)} placeholder="Ej. Sitio web para una cafetería local..." aria-invalid={Boolean(error("description"))} aria-describedby={describedBy("description")} /></FieldError>
        <FieldError name="learning" error={error("learning")} className={styles.error}><label htmlFor="learning">Aprendizaje</label><textarea id="learning" name="learning" rows={5} value={values.learning} onChange={(e) => changeValue("learning", e.target.value)} placeholder="Ej. Aprendí a integrar APIs con React..." aria-invalid={Boolean(error("learning"))} aria-describedby={describedBy("learning")} /></FieldError>
      </fieldset>
      <fieldset className={styles.section} disabled={isSubmitting}><legend>Tecnologías</legend><p className={styles.help} id="technologies-help">Escribe una tecnología y presiona Enter o coma para agregarla.</p>
        <FieldError name="technologies" error={error("technologies")} className={styles.error}><label htmlFor="technologies">Tecnologías utilizadas</label><input id="technologies" type="text" value={technologyInput} onChange={(e) => setTechnologyInput(e.target.value)} onKeyDown={handleTechnologyKeyDown} onBlur={addTechnology} aria-invalid={Boolean(error("technologies"))} aria-describedby={describedBy("technologies", "technologies-help")} placeholder="Ej. React, Next.js, TypeScript" autoComplete="off" /></FieldError>
        {values.technologies.map((technology, index) => <input key={`${technology}-${index}`} type="hidden" name="technologies" value={technology} />)}
        {values.technologies.length > 0 && <ul className={styles.technologyList} aria-label="Tecnologías agregadas">{values.technologies.map((technology, index) => <li key={`${technology}-${index}`}><span>{technology}</span><button type="button" onClick={() => removeTechnology(index)} aria-label={`Quitar ${technology}`}>Quitar</button></li>)}</ul>}
      </fieldset>
      <fieldset className={styles.section} disabled={isSubmitting}><legend>Enlaces</legend><div className={styles.grid}>
        <FieldError name="repository_url" error={error("repository_url")} className={styles.error}><label htmlFor="repository_url">Repositorio (opcional)</label><input id="repository_url" name="repository_url" type="url" inputMode="url" value={values.repository_url} onChange={(e) => changeValue("repository_url", e.target.value)} placeholder="Ej. https://github.com/usuario/proyecto" aria-invalid={Boolean(error("repository_url"))} aria-describedby={describedBy("repository_url")} /></FieldError>
        <FieldError name="live_url" error={error("live_url")} className={styles.error}><label htmlFor="live_url">Sitio web (opcional)</label><input id="live_url" name="live_url" type="url" inputMode="url" value={values.live_url} onChange={(e) => changeValue("live_url", e.target.value)} placeholder="Ej. https://mi-proyecto.com" aria-invalid={Boolean(error("live_url"))} aria-describedby={describedBy("live_url")} /></FieldError>
      </div></fieldset>
      <fieldset className={styles.section} disabled={isSubmitting}><legend>Publicación y orden</legend><div className={styles.grid}>
        <FieldError name="publication_status" error={error("publication_status")} className={styles.error}><label htmlFor="publication_status">Estado de publicación</label><select id="publication_status" name="publication_status" value={values.publication_status} onChange={(e) => changeValue("publication_status", e.target.value)} aria-invalid={Boolean(error("publication_status"))} aria-describedby={describedBy("publication_status")}><option value="draft">Borrador</option><option value="published">Publicado</option></select></FieldError>
        <FieldError name="display_order" error={error("display_order")} className={styles.error}><label htmlFor="display_order">Orden de presentación</label><input id="display_order" name="display_order" type="number" value={values.display_order} onChange={(e) => changeValue("display_order", e.target.value)} step={1} placeholder="Ej. 1" aria-invalid={Boolean(error("display_order"))} aria-describedby={describedBy("display_order")} /></FieldError>
      </div><label className={styles.checkbox} htmlFor="is_featured"><input id="is_featured" name="is_featured" type="checkbox" checked={values.is_featured} onChange={(e) => setValues((current) => ({ ...current, is_featured: e.target.checked }))} aria-invalid={Boolean(error("is_featured"))} aria-describedby={describedBy("is_featured")} /><span>Marcar como proyecto destacado</span></label><p id="is_featured-error" className={styles.error}>{error("is_featured")}</p></fieldset>
      <fieldset className={styles.section}><legend>Capturas</legend><p className={styles.help}>Las rutas de escritorio, tablet y teléfono se conectarán a Storage en una tarea posterior. Esta pantalla aún no permite cargar archivos.</p><div className={styles.captureGrid}><div className={styles.capture}><h2>Escritorio</h2><p>Campo previsto: <code>desktop_image_path</code></p></div><div className={styles.capture}><h2>Tablet</h2><p>Campo previsto: <code>tablet_image_path</code></p></div><div className={styles.capture}><h2>Teléfono</h2><p>Campo previsto: <code>mobile_image_path</code></p></div></div></fieldset>
      <div className={styles.actions}><button className={styles.primaryAction} type="submit" disabled={isSubmitting}>{isSubmitting ? "Validando…" : "Guardar"}</button><a className={styles.secondaryAction} href="/admin/proyectos">Cancelar y volver</a></div>
      <p className={state.success ? styles.success : styles.notice} role={state.success ? "status" : "alert"} aria-atomic="true">{isSubmitting ? "" : state.message || "Los datos se validarán antes de poder crear el proyecto."}</p>
    </form>
  );
}

/** Agrupa un control con su mensaje accesible, enlazado por `aria-describedby`. */
function FieldError({ name, error, className, children }: { name: string; error?: string; className: string; children: ReactNode }) {
  return <div className={styles.field}>{children}<p id={`${name}-error`} className={className}>{error}</p></div>;
}
