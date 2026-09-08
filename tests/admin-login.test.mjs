import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import navigation from "next/navigation.js";

// Run the actual action with isolated Auth and Next.js boundaries; no network.
const source = ts.transpileModule(
  fs.readFileSync("src/app/(admin)/admin/login/actions.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

function setup(options = {}) {
  const calls = [];
  const auth = {
    async signInWithPassword(credentials) {
      calls.push(["signIn", credentials]);
      if (options.signInThrows) throw new TypeError("private connection detail");
      return { error: options.signInError ?? null };
    },
    async getUser() {
      calls.push(["getUser"]);
      if (options.getUserThrows) throw new TypeError("private connection detail");
      return {
        data: { user: options.user === undefined ? { app_metadata: { role: "admin" } } : options.user },
        error: options.getUserError ?? null,
      };
    },
    async signOut(scope) {
      calls.push(["signOut", scope]);
      if (options.cleanupThrows) throw new Error("private cleanup detail");
      return { error: options.cleanupError ?? null };
    },
  };
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === "@/lib/supabase/server") return { createClient: async () => { calls.push(["client"]); return { auth }; } };
      if (name === "next/navigation") return { redirect: (url) => { calls.push(["redirect", url]); throw new Error(`REDIRECT:${url}`); } };
      if (name === "@supabase/supabase-js") return {
        isAuthError: (error) => error?.auth === true,
        isAuthRetryableFetchError: (error) => error?.retryable === true,
      };
      throw new Error("Unexpected import");
    },
  });
  return { calls, run: (data) => exports.loginAdmin({ message: "", role: "admin" }, data) };
}

function form(email = "owner@example.test", password = "  fictional password  ") {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  data.set("role", "admin");
  data.set("redirectTo", "https://example.test/untrusted");
  return data;
}

test("server rejects missing, empty, malformed and non-string fields before Auth", async () => {
  for (const data of [new FormData(), form(""), form("invalid"), form("a@b@c.test"), form("owner@example.test", ""), form(new Blob(["email"])), form("owner@example.test", new Blob(["password"]))]) {
    const { run, calls } = setup();
    const result = await run(data);
    assert.ok(result.fieldErrors.email || result.fieldErrors.password);
    assert.equal(calls.length, 0);
  }
});

test("verified admin redirects only to /admin; trims email, preserves password", async () => {
  const { run, calls } = setup();
  await assert.rejects(run(form("  owner@example.test  ")), /REDIRECT:\/admin$/);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ["client"], ["signIn", { email: "owner@example.test", password: "  fictional password  " }],
    ["getUser"], ["redirect", "/admin"],
  ]);
});

test("invalid credentials and unauthorized users get the same safe message", async () => {
  const invalid = setup({ signInError: { auth: true, status: 400, message: "sensitive" } });
  const expected = await invalid.run(form());
  assert.equal(invalid.calls.length, 2);
  for (const user of [null, { app_metadata: {}, user_metadata: { role: "admin" } }, { app_metadata: { role: "Admin" } }]) {
    const { run, calls } = setup({ user });
    const result = await run(form());
    assert.equal(result.message, expected.message);
    assert.deepEqual(JSON.parse(JSON.stringify(calls.at(-1))), ["signOut", { scope: "local" }]);
    assert.deepEqual(Object.keys(result), ["message"]);
  }
});

test("getUser errors and exceptions clean up the new session", async () => {
  for (const options of [{ getUserError: { auth: true, status: 500 } }, { getUserThrows: true }]) {
    const { run, calls } = setup(options);
    assert.match((await run(form())).message, /conectar/);
    assert.equal(calls.at(-1)[0], "signOut");
  }
});

test("cleanup errors and exceptions are reported and never redirect", async () => {
  for (const options of [{ cleanupError: { message: "private" } }, { cleanupThrows: true }]) {
    const { run, calls } = setup({ user: { app_metadata: {} }, ...options });
    assert.match((await run(form())).message, /cierre de la sesión local/);
    assert.ok(!calls.some(([name]) => name === "redirect"));
  }
});

test("rate limits and connection failures have safe actionable messages", async () => {
  for (const [options, pattern] of [
    [{ signInError: { auth: true, status: 429 } }, /Demasiados intentos/],
    [{ signInError: { auth: true, retryable: true } }, /conectar/],
    [{ signInThrows: true }, /conectar/],
  ]) {
    const { run } = setup(options);
    assert.match((await run(form())).message, pattern);
  }
});

test("client preserves Next redirects but recovers from transport errors", async () => {
  const clientSource = ts.transpileModule(
    fs.readFileSync("src/components/admin/AdminLoginForm/AdminLoginForm.tsx", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } },
  ).outputText;
  for (const shouldRedirect of [true, false]) {
    let clientAction;
    const exports = {};
    vm.runInNewContext(clientSource, {
      exports,
      require(name) {
        if (name === "react/jsx-runtime") return { jsx: () => null, jsxs: () => null };
        if (name === "react") return {
          useRef: () => ({ current: null }),
          useState: () => [{}, () => {}],
          useEffect: () => {},
          useActionState: (action) => { clientAction = action; return [{ message: "" }, () => {}, false]; },
        };
        if (name === "next/navigation") return navigation;
        if (name.endsWith("/actions")) return { loginAdmin: async () => {
          if (shouldRedirect) navigation.redirect("/admin");
          throw new TypeError("private transport detail");
        } };
        if (name.endsWith(".css")) return { default: {} };
        throw new Error("Unexpected import");
      },
    });
    exports.AdminLoginForm();
    if (shouldRedirect) {
      await assert.rejects(clientAction({ message: "" }, form()), (error) => error.digest?.startsWith("NEXT_REDIRECT;") === true);
    } else {
      const result = await clientAction({ message: "" }, form());
      assert.match(result.message, /Comprueba tu conexión/);
      assert.deepEqual(Object.keys(result), ["message"]);
    }
  }
});
