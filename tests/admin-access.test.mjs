import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  fs.readFileSync("src/lib/supabase/admin.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

function setup(options = {}) {
  const calls = [];
  const exports = {};

  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === "server-only") return {};
      if (name === "react") return { cache: (callback) => callback };
      if (name === "./server") {
        return {
          createClient: async () => ({
            auth: {
              async getUser() {
                calls.push("getUser");
                if (options.getUserThrows) throw new Error("unavailable");
                return {
                  data: { user: options.user },
                  error: options.error ?? null,
                };
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

  return { calls, requireAdmin: exports.requireAdmin };
}

test("server guard permits only a verified administrator", async () => {
  const user = { id: "admin-id", app_metadata: { role: "admin" } };
  const { calls, requireAdmin } = setup({ user });

  assert.deepEqual(await requireAdmin(), user);
  assert.deepEqual(calls, ["getUser"]);
});

test("server guard redirects anonymous, non-admin, and invalid sessions to login", async () => {
  for (const options of [
    { user: null },
    { user: { app_metadata: {} } },
    { user: { app_metadata: { role: "Admin" } } },
    { user: { app_metadata: { role: "admin" } }, error: new Error("invalid session") },
    { getUserThrows: true },
  ]) {
    const { calls, requireAdmin } = setup(options);
    await assert.rejects(requireAdmin(), /REDIRECT:\/admin\/login$/);
    assert.deepEqual(calls.at(-1), ["redirect", "/admin/login"]);
  }
});
