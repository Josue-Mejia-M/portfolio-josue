import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Ejecuta los módulos reales de validación y Server Action sin Supabase ni red.
const formStateSource = ts.transpileModule(
  fs.readFileSync("src/features/projects/form-state.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
// El estado se evalúa aparte porque dejó de ser una exportación inválida del
// módulo `use server`; así la prueba conserva el límite real de módulos.
const formStateExports = {};
vm.runInNewContext(formStateSource, { exports: formStateExports });

const validationSource = ts.transpileModule(
  fs.readFileSync("src/features/projects/validation.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
const validationExports = {};
vm.runInNewContext(validationSource, {
  exports: validationExports,
  URL,
  require(name) {
    if (name === "./form-state") return formStateExports;
    throw new Error(`Unexpected import: ${name}`);
  },
});
const { validateProjectForm } = validationExports;

function validData(overrides = {}) {
  const data = new FormData();
  const fields = {
    title: "Página de cafetería",
    slug: "pagina-de-cafeteria",
    description: "Sitio web para presentar el menú, la ubicación y la propuesta de una cafetería local.",
    project_type: "personal",
    development_status: "completed",
    learning: "Aprendí a organizar el contenido, adaptar la interfaz y construir una experiencia clara.",
    repository_url: "https://github.com/usuario/proyecto",
    live_url: "https://example.com/cafeteria",
    publication_status: "draft",
    display_order: "0",
    ...overrides,
  };
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

test("acepta un borrador válido, slug, URLs HTTPS, tecnologías y enums", () => {
  const data = validData();
  data.append("technologies", "React");
  data.append("technologies", "Next.js");
  const result = validateProjectForm(data);
  assert.equal(result.success, true);
  assert.deepEqual(JSON.parse(JSON.stringify(result.values.technologies)), ["React", "Next.js"]);
});

test("normaliza espacios exteriores y conserva los valores al fallar", () => {
  const data = validData({ title: "  ", repository_url: " https://example.com/repo " });
  const result = validateProjectForm(data);
  assert.equal(result.success, false);
  assert.equal(result.fieldErrors.title, "El título es obligatorio.");
  assert.equal(result.values.title, "");
  assert.equal(result.values.repository_url, "https://example.com/repo");
});

test("rechaza slug, URL, enum, orden y booleano manipulados en sus campos", () => {
  const data = validData({ slug: "Página café", live_url: "http://example.com", project_type: "root", display_order: "1.5" });
  data.set("is_featured", "true");
  const result = validateProjectForm(data);
  assert.equal(result.success, false);
  for (const field of ["slug", "live_url", "project_type", "display_order", "is_featured"]) assert.ok(result.fieldErrors[field]);
  assert.equal(result.values.live_url, "http://example.com");
});

test("rechaza tecnologías vacías, demasiado largas, repetidas o por encima del límite", () => {
  for (const technologies of [[""], ["x".repeat(31)], ["React", "react"], Array.from({ length: 13 }, (_, i) => `Tech ${i}`)]) {
    const data = validData();
    for (const technology of technologies) data.append("technologies", technology);
    const result = validateProjectForm(data);
    assert.equal(result.success, false);
    assert.ok(result.fieldErrors.technologies);
  }
});

test("no acepta publicación sin tecnologías y capturas que todavía no son campos del formulario", () => {
  const data = validData({ publication_status: "published" });
  const result = validateProjectForm(data);
  assert.equal(result.success, false);
  assert.match(result.fieldErrors.publication_status, /capturas/);
  assert.match(result.fieldErrors.technologies, /Añade/);
});

test("la Server Action reautoriza y solo devuelve validación: no hay acceso a persistencia", async () => {
  const source = ts.transpileModule(
    fs.readFileSync("src/app/(admin)/admin/(panel)/proyectos/nuevo/actions.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
  ).outputText;
  let authorizations = 0;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === "@/lib/supabase/admin") return { requireAdmin: async () => { authorizations += 1; } };
      if (name === "@/features/projects/validation") return { validateProjectForm };
      throw new Error(`Unexpected persistence import: ${name}`);
    },
  });
  const result = await exports.validateNewProject({}, validData({ title: "" }));
  assert.equal(authorizations, 1);
  assert.equal(result.success, false);
  assert.equal(result.fieldErrors.title, "El título es obligatorio.");
  assert.equal(result.values.slug, "pagina-de-cafeteria");
});
