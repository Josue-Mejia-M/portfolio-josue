import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Ejecuta el módulo real aislando Supabase para que la prueba no requiera red.
const source = ts.transpileModule(
  fs.readFileSync("src/features/projects/admin-queries.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

/** Construye un doble encadenable del cliente y registra cómo se consulta. */
function setup(result) {
  const calls = [];
  const exports = {};
  const query = {
    select(columns) {
      calls.push(["select", columns]);
      return this;
    },
    order(column, options) {
      calls.push(["order", column, options]);
      return this;
    },
    then(resolve) {
      return Promise.resolve(result).then(resolve);
    },
  };

  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === "server-only") return {};
      if (name === "@/lib/supabase/server") {
        return {
          createClient: async () => ({
            from(table) {
              calls.push(["from", table]);
              return query;
            },
          }),
        };
      }
      throw new Error(`Unexpected import: ${name}`);
    },
  });

  return { calls, listAdminProjects: exports.listAdminProjects };
}

// El contrato de orden protege el listado frente a cambios accidentales.
test("admin project query selects only list fields and uses a stable display order", async () => {
  const projects = [{ id: "a", title: "Cafetería", display_order: 0 }];
  const { calls, listAdminProjects } = setup({ data: projects, error: null });

  assert.deepEqual(await listAdminProjects(), projects);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ["from", "projects"],
    ["select", "id, title, publication_status, is_featured, development_status, display_order"],
    ["order", "display_order", { ascending: true }],
    ["order", "created_at", { ascending: false }],
    ["order", "id", { ascending: true }],
  ]);
});

test("admin project query reports a safe error when Supabase fails", async () => {
  const { listAdminProjects } = setup({ data: null, error: { message: "private detail" } });

  await assert.rejects(
    listAdminProjects(),
    /No se pudieron cargar los proyectos administrativos\./,
  );
});
