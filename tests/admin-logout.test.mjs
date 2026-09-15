import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  fs.readFileSync("src/app/(admin)/admin/(panel)/actions.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

function setup(options = {}) {
  const calls = [];
  const exports = {};

  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === "@/lib/supabase/admin") {
        return {
          requireAdmin: async () => {
            calls.push("requireAdmin");
            if (options.unauthorized) throw new Error("REDIRECT:/admin/login");
          },
        };
      }
      if (name === "@/lib/supabase/server") {
        return {
          createClient: async () => ({
            auth: {
              async signOut(scope) {
                calls.push(["signOut", scope]);
                return { error: options.signOutError ?? null };
              },
            },
          }),
        };
      }
      if (name === "next/navigation") {
        return {
          redirect(url) {
            calls.push(["redirect", url]);
            throw new Error(`REDIRECT:${url}`);
          },
        };
      }
      throw new Error(`Unexpected import: ${name}`);
    },
  });

  return { calls, logoutAdmin: exports.logoutAdmin };
}

test("logout invalidates the local Supabase session and redirects to the fixed login URL", async () => {
  const { calls, logoutAdmin } = setup();

  await assert.rejects(logoutAdmin(), /REDIRECT:\/admin\/login$/);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    "requireAdmin",
    ["signOut", { scope: "local" }],
    ["redirect", "/admin/login"],
  ]);
});

test("logout never redirects when Supabase could not invalidate the local session", async () => {
  const { calls, logoutAdmin } = setup({ signOutError: new Error("unavailable") });

  await assert.rejects(logoutAdmin(), /No se pudo cerrar la sesión\./);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    "requireAdmin",
    ["signOut", { scope: "local" }],
  ]);
});

test("logout reuses the server guard so an expired session cannot be signed out as an admin", async () => {
  const { calls, logoutAdmin } = setup({ unauthorized: true });

  await assert.rejects(logoutAdmin(), /REDIRECT:\/admin\/login$/);
  assert.deepEqual(calls, ["requireAdmin"]);
});
