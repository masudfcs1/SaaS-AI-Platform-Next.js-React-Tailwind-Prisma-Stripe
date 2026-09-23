const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Compile the real TypeScript modules using the project's installed compiler.
// Environment and fetch are isolated so these tests never use real credentials.
function loadModule(file, { env = {}, fetch, dependencies = {} } = {}) {
  const filename = path.join(__dirname, "..", file);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: (name) => name === "server-only" ? {} : dependencies[name] ?? require(name),
    process: { env },
    fetch: fetch ?? (() => { throw new Error("Unexpected network request"); }),
    AbortController,
    SyntaxError,
    setTimeout,
    clearTimeout,
  }, { filename });
  return compiledModule.exports;
}

const messages = [{ role: "user", content: "Hello" }];
const defaultEnv = { GEMINI_API_KEYS: "first-key,second-key", GEMINI_MODELS: "preferred,fallback" };
const success = (parts = [{ text: "Hello back" }]) => Response.json({
  candidates: [{ finishReason: "STOP", content: { parts } }],
});
const failure = (status, error = {}) => Response.json({ error }, { status });
const gemini = (fetch, env = defaultEnv) => loadModule("lib/gemini.ts", { env, fetch });

test("loads private credentials, trims/deduplicates lists, and preserves default model priority", () => {
  const api = gemini(undefined, {
    GEMINI_API_KEYS: " first, ,second,first ", GEMINI_API_KEY: " second ",
    NEXT_PUBLIC_GEMINI_API_KEY: "must-not-be-used",
  });
  assert.equal(api.GEMINI_API_KEYS.join(","), "first,second");
  assert.equal(api.GEMINI_MODELS.join(","),
    "gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-flash-latest");
});

test("maps chat history and system instructions, authenticates in headers, and excludes thought parts", async () => {
  let request;
  const api = gemini(async (url, options) => {
    request = { url, ...options };
    return success([{ text: "private reasoning", thought: true }, { text: "Hello " }, { text: "back" }]);
  });
  const result = await api.generateGeminiResponse({
    messages: [...messages, { role: "assistant", content: "Previous reply" }, ...messages],
    systemInstruction: "Write code", temperature: 0.5, maxOutputTokens: 256,
  });
  assert.equal(result.role, "assistant");
  assert.equal(result.content, "Hello back");
  assert.equal(request.url, "https://generativelanguage.googleapis.com/v1beta/models/preferred:generateContent");
  assert.equal(request.headers["x-goog-api-key"], "first-key");
  assert.equal(request.cache, "no-store");
  const body = JSON.parse(request.body);
  assert.deepEqual(body.contents.map(item => item.role), ["user", "model", "user"]);
  assert.deepEqual(body.systemInstruction, { parts: [{ text: "Write code" }] });
  assert.deepEqual(body.generationConfig, { temperature: 0.5, maxOutputTokens: 256 });
});

test("rotates the starting key between requests and supports a single-prompt helper", async () => {
  const keys = [];
  const api = gemini(async (_, request) => { keys.push(request.headers["x-goog-api-key"]); return success(); });
  assert.equal(await api.generateGeminiText("Hello"), "Hello back");
  await api.generateGeminiText("Hello again");
  assert.deepEqual(keys, ["first-key", "second-key"]);
});

test("tries remaining keys before moving to the next preferred model", async () => {
  const attempts = [];
  const api = gemini(async (url, request) => {
    attempts.push([url.split("/").pop(), request.headers["x-goog-api-key"]]);
    return url.includes("/preferred:") ? failure(404) : success();
  });
  await api.generateGeminiResponse({ messages });
  assert.deepEqual(attempts, [
    ["preferred:generateContent", "first-key"],
    ["preferred:generateContent", "second-key"],
    ["fallback:generateContent", "first-key"],
  ]);
});

test("skips an invalid API key for the rest of that request", async () => {
  const attempts = [];
  const api = gemini(async (url, request) => {
    const key = request.headers["x-goog-api-key"];
    attempts.push(key);
    if (key === "first-key") return failure(400, { details: [{ reason: "API_KEY_INVALID" }] });
    return url.includes("/preferred:") ? failure(404) : success();
  });
  await api.generateGeminiResponse({ messages });
  assert.deepEqual(attempts, ["first-key", "second-key", "second-key"]);
});

test("recovers from unauthorized, permission, quota, server, and network failures", async (t) => {
  for (const status of [401, 403, 429, 503, "network"]) {
    await t.test(String(status), async () => {
      let calls = 0;
      const api = gemini(async () => {
        if (++calls > 1) return success();
        if (status === "network") throw new Error("Network failed");
        return failure(status);
      });
      assert.equal((await api.generateGeminiResponse({ messages })).content, "Hello back");
      assert.equal(calls, 2);
    });
  }
});

test("does not retry malformed requests, blocked content, or empty successful responses", async (t) => {
  const cases = [
    [() => failure(400), 400],
    [() => Response.json({ promptFeedback: { blockReason: "SAFETY" } }), 422],
    [() => Response.json({ candidates: [{ finishReason: "SAFETY", content: { parts: [{ text: "blocked" }] } }] }), 422],
    [() => Response.json({ candidates: [] }), 502],
  ];
  for (const [response, status] of cases) {
    await t.test(String(status), async () => {
      let calls = 0;
      const api = gemini(async () => { calls++; return response(); });
      await assert.rejects(api.generateGeminiResponse({ messages }), error => error.status === status);
      assert.equal(calls, 1);
    });
  }
});

test("bounds failover attempts and never exposes provider errors or credentials", async () => {
  let calls = 0;
  const api = gemini(async () => {
    calls++;
    return failure(503, { message: "Sensitive details: first-key second-key" });
  });
  await assert.rejects(api.generateGeminiResponse({ messages }), error => {
    assert.equal(error.status, 503);
    assert.doesNotMatch(error.message, /Sensitive|first-key|second-key/);
    return true;
  });
  assert.equal(calls, 4);
});

test("rejects invalid messages and missing configuration before making a network request", async () => {
  const api = gemini();
  for (const invalid of [undefined, null, [], [{ role: "system", content: "Hello" }],
    [{ role: "user", content: "  " }], [{ role: "assistant", content: "Hello" }]]) {
    await assert.rejects(api.generateGeminiResponse({ messages: invalid }), error => error.status === 400);
  }
  await assert.rejects(gemini(undefined, {}).generateGeminiResponse({ messages }), error => error.status === 503);
});

test("honors the total timeout, including when reading a response body", async () => {
  const api = gemini(async (_, { signal }) => ({
    ok: true,
    json: () => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true })),
  }));
  await assert.rejects(api.generateGeminiResponse({ messages, timeoutMs: 10 }), error => error.status === 504);
});

test("stops immediately when the caller cancels", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(gemini().generateGeminiResponse({ messages, signal: controller.signal }), error => error.status === 499);
});

for (const route of ["conversation", "code"]) {
  test(`${route} route keeps the frontend response contract and validates JSON`, async () => {
    const bodies = [];
    const api = gemini(async (_, request) => { bodies.push(JSON.parse(request.body)); return success(); });
    const { POST } = loadModule(`app/api/${route}/route.ts`, { dependencies: { "@/lib/gemini": api } });
    const makeRequest = (body) => new Request(`http://localhost/api/${route}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
    });
    const response = await POST(makeRequest(JSON.stringify({ messages })));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { role: "assistant", content: "Hello back" });
    if (route === "code") assert.match(bodies[0].systemInstruction.parts[0].text, /code generator/);
    else assert.equal(bodies[0].systemInstruction, undefined);
    assert.equal((await POST(makeRequest("{"))).status, 400);
    assert.equal((await POST(makeRequest("null"))).status, 400);
    assert.equal((await POST(makeRequest('{"messages":[]}'))).status, 400);
    assert.equal(bodies.length, 1);
  });
}
