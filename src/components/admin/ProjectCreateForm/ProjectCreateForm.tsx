"use client";

import { useState, type KeyboardEvent } from "react";

import styles from "./ProjectCreateForm.module.css";

/** Teclas que convierten el texto actual en un elemento de la lista local. */
const technologySeparators = new Set(["Enter", ","]);

/**
 * Interfaz local para preparar un proyecto nuevo. No tiene Server Action ni
 * realiza persistencia: la conexión con la creación se incorpora después.
 */
export function ProjectCreateForm() {
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [technologyInput, setTechnologyInput] = useState("");

  /** Añade al estado visual el texto confirmado, sin aplicar reglas de negocio. */
  function addTechnology() {
    const technology = technologyInput.trim();

    if (!technology) return;

    setTechnologies((current) => [...current, technology]);
    setTechnologyInput("");
  }

  /** Permite capturar varias tecnologías sin abandonar el campo con el teclado. */
  function handleTechnologyKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!technologySeparators.has(event.key)) return;

    event.preventDefault();
    addTechnology();
  }

  /** Elimina una etiqueta solamente de la lista temporal del navegador. */
  function removeTechnology(index: number) {
    setTechnologies((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  // El submit se neutraliza hasta que la tarea de creación aporte una Server Action.
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <fieldset className={styles.section}>
        <legend>Información general</legend>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="title">Título</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Ej. Página web para una cafetería"
              autoComplete="off"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="Ej. pagina-web-cafeteria"
              autoComplete="off"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="project_type">Tipo de proyecto</label>
            <select id="project_type" name="project_type" defaultValue="">
              <option value="" disabled>Selecciona un tipo</option>
              <option value="personal">Proyecto personal</option>
              <option value="academic">Proyecto académico</option>
              <option value="professional">Proyecto profesional</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="development_status">Estado de desarrollo</label>
            <select id="development_status" name="development_status" defaultValue="">
              <option value="" disabled>Selecciona un estado</option>
              <option value="in_progress">En desarrollo</option>
              <option value="completed">Finalizado</option>
              <option value="paused">Pausado</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Descripción y aprendizaje</legend>
        <div className={styles.field}>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Ej. Sitio web para una cafetería local..."
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="learning">Aprendizaje</label>
          <textarea
            id="learning"
            name="learning"
            rows={5}
            placeholder="Ej. Aprendí a integrar APIs con React..."
          />
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Tecnologías</legend>
        <p className={styles.help} id="technologies-help">
          Escribe una tecnología y presiona Enter o coma para agregarla.
        </p>
        <div className={styles.field}>
          <label htmlFor="technologies">Tecnologías utilizadas</label>
          <input
            id="technologies"
            name="technologies"
            type="text"
            value={technologyInput}
            onChange={(event) => setTechnologyInput(event.target.value)}
            onKeyDown={handleTechnologyKeyDown}
            onBlur={addTechnology}
            aria-describedby="technologies-help"
            placeholder="Ej. React, Next.js, TypeScript"
            autoComplete="off"
          />
        </div>
        {technologies.length > 0 && (
          <ul className={styles.technologyList} aria-label="Tecnologías agregadas">
            {technologies.map((technology, index) => (
              <li key={`${technology}-${index}`}>
                <span>{technology}</span>
                <button
                  type="button"
                  onClick={() => removeTechnology(index)}
                  aria-label={`Quitar ${technology}`}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Enlaces</legend>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="repository_url">Repositorio (opcional)</label>
            <input
              id="repository_url"
              name="repository_url"
              type="url"
              inputMode="url"
              placeholder="Ej. https://github.com/usuario/proyecto"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="live_url">Sitio web (opcional)</label>
            <input
              id="live_url"
              name="live_url"
              type="url"
              inputMode="url"
              placeholder="Ej. https://mi-proyecto.com"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Publicación y orden</legend>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="publication_status">Estado de publicación</label>
            <select id="publication_status" name="publication_status" defaultValue="draft">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="display_order">Orden de presentación</label>
            <input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={0}
              step={1}
              placeholder="Ej. 1"
            />
          </div>
        </div>
        <label className={styles.checkbox} htmlFor="is_featured">
          <input id="is_featured" name="is_featured" type="checkbox" />
          <span>Marcar como proyecto destacado</span>
        </label>
      </fieldset>

      {/* Se conserva la presencia visual de las tres rutas sin anticipar Storage. */}
      <fieldset className={styles.section}>
        <legend>Capturas</legend>
        <p className={styles.help}>
          Las rutas de escritorio, tablet y teléfono se conectarán a Storage en una tarea posterior. Esta pantalla aún no permite cargar archivos.
        </p>
        <div className={styles.captureGrid}>
          <div className={styles.capture}>
            <h2>Escritorio</h2>
            <p>Campo previsto: <code>desktop_image_path</code></p>
          </div>
          <div className={styles.capture}>
            <h2>Tablet</h2>
            <p>Campo previsto: <code>tablet_image_path</code></p>
          </div>
          <div className={styles.capture}>
            <h2>Teléfono</h2>
            <p>Campo previsto: <code>mobile_image_path</code></p>
          </div>
        </div>
      </fieldset>

      <div className={styles.actions}>
        <button className={styles.primaryAction} type="submit">
          Crear proyecto
        </button>
        <a className={styles.secondaryAction} href="/admin/proyectos">
          Cancelar y volver
        </a>
      </div>
      <p className={styles.notice} aria-live="polite">
        La creación todavía no está conectada: este formulario no guarda cambios.
      </p>
    </form>
  );
}
