const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");
const OpenAI = require("openai").default;

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
const imageResult = () => ({ data: [{ b64_json: png.toString("base64") }] });
const speechBytes = Buffer.from("ID3 test speech bytes");
const wavBytes = Buffer.from("RIFF....WAVEfmt ....data....");
const secret = "sk-test-only-never-a-real-credential";

// The production routes/helpers run in an isolated environment with a mocked SDK.
// Real SDK error classes are retained; no network or local credentials are used.
function harness({ env = { OPENAI_API_KEY: secret }, image, audio, timeoutMs } = {}) {
  const calls = [];
  const clients = [];
  let now = 100_000;
  class FakeDate extends Date {
    static now() { return now; }
  }
  class MockOpenAI {
    constructor(options) {
      clients.push(options);
      this.images = { generate: (body, request) => {
        calls.push({ kind: "image", body, request });
        return image ? image(body, request) : Promise.resolve(imageResult());
      } };
      this.audio = { speech: { create: (body, request) => {
        calls.push({ kind: "audio", body, request });
        return audio ? audio(body, request) : Promise.resolve(new Response(speechBytes));
      } } };
    }
  }
  for (const name of ["APIError", "APIUserAbortError", "APIConnectionError", "APIConnectionTimeoutError"]) {
    MockOpenAI[name] = OpenAI[name];
  }
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const filename = path.join(__dirname, "..", file);
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const record = { exports: {} };
    cache.set(file, record);
    vm.runInNewContext(compiled, {
      module: record,
      exports: record.exports,
      require: (name) => {
        if (name === "server-only") return {};
        if (name === "openai") return { default: MockOpenAI };
        if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`);
        return require(name);
      },
      process: { env },
      Request, Response, Headers, URL, Buffer, Uint8Array, ArrayBuffer,
      TextDecoder, AbortController, Date: FakeDate,
      setTimeout: timeoutMs === undefined ? setTimeout : (callback) => setTimeout(callback, timeoutMs),
      clearTimeout,
    }, { filename });
    return record.exports;
  }
  return {
    calls, clients, load,
    image: load("app/api/image/route.ts").POST,
    audio: load("app/api/audio/route.ts").POST,
    advance: (ms) => { now += ms; },
  };
}

function request(kind, body, options = {}) {
  return new Request(`http://localhost/api/${kind}`, {
    method: "POST",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    body: typeof body === "string" || body instanceof ReadableStream ? body : JSON.stringify(body),
  });
}

async function expectError(response, status, code) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const data = await response.json();
  assert.deepEqual(Object.keys(data).sort(), ["code", "error"]);
  assert.equal(data.code, code);
  assert.equal(typeof data.error, "string");
  assert.doesNotMatch(JSON.stringify(data), /sk-test-only|SENSITIVE_PROVIDER_MESSAGE|stack trace/);
  return data;
}

test("imports without credentials and lazily reports missing private configuration", async () => {
  const api = harness({ env: { NEXT_PUBLIC_OPENAI_API_KEY: "must-not-be-used" } });
  assert.equal(api.clients.length, 0);
  const error = await expectError(await api.image(request("image", { prompt: "A small garden" })), 503, "not_configured");
  assert.match(error.error, /OPENAI_API_KEY/);
  assert.equal(api.clients.length, 0);
  assert.equal(api.calls.length, 0);
});

test("image route returns a real PNG download and uses one non-retried SDK request", async () => {
  const api = harness();
  const response = await api.image(request("image", { prompt: "  A small garden  " }, {
    headers: { Origin: "http://localhost" },
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.equal(response.headers.get("content-disposition"), 'attachment; filename="dune-image.png"');
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
  assert.deepEqual(JSON.parse(JSON.stringify(api.calls[0].body)), {
    model: "gpt-image-2.5-flare", prompt: "A small garden", size: "1024x1024", quality: "medium", output_format: "png", n: 1,
  });
  assert.equal(api.calls[0].request.maxRetries, 0);
  assert.equal(api.calls[0].request.timeout, 120_000);
  assert.equal(api.calls[0].request.signal.aborted, false);
  assert.equal(api.clients[0].maxRetries, 0);
  assert.equal(api.clients[0].timeout, 120_000);
  await api.audio(request("audio", { input: "Hello" }));
  assert.equal(api.clients.length, 1, "The lazy client is reused between media requests");
});

test("origin validation uses the browser destination through Next URL normalization and HTTPS proxies", async () => {
  const api = harness();
  for (const headers of [
    { Host: "127.0.0.1:3109", Origin: "http://127.0.0.1:3109" },
    { Host: "studio.example", Origin: "https://studio.example", "X-Forwarded-Proto": "https" },
  ]) {
    assert.equal((await api.image(request("image", { prompt: "A garden" }, { headers }))).status, 200);
  }
  for (const headers of [
    { Host: "studio.example", Origin: "https://other.example", "X-Forwarded-Proto": "https" },
    { Host: "studio.example", Origin: "http://localhost" },
    { Host: "studio.example", Origin: "https://studio.example/path", "X-Forwarded-Proto": "https" },
  ]) {
    await expectError(await api.image(request("image", { prompt: "A garden" }, { headers })), 403, "origin_not_allowed");
  }
  assert.equal(api.calls.length, 2);
});

test("image options and server-configured model override reach the SDK", async () => {
  const api = harness({ env: { OPENAI_API_KEY: secret, OPENAI_IMAGE_MODEL: "custom-image-model" } });
  assert.equal((await api.image(request("image", { prompt: "A landscape", size: "1536x1024", quality: "high" }))).status, 200);
  assert.equal(api.calls[0].body.model, "custom-image-model");
  assert.equal(api.calls[0].body.size, "1536x1024");
  assert.equal(api.calls[0].body.quality, "high");
});

test("audio route returns downloadable MP3/WAV bytes and preserves speech settings", async (t) => {
  for (const [format, contentType] of [["mp3", "audio/mpeg"], ["wav", "audio/wav"]]) {
    await t.test(format, async () => {
      const expectedBytes = format === "wav" ? wavBytes : speechBytes;
      const api = harness({
        env: { OPENAI_API_KEY: secret, OPENAI_AUDIO_MODEL: "custom-speech-model" },
        audio: async () => new Response(expectedBytes),
      });
      const response = await api.audio(request("audio", {
        input: "  Hello from Dune.  ", voice: "cedar", format, speed: 0.75, instructions: "  Speak warmly.  ",
      }));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type"), contentType);
      assert.equal(response.headers.get("content-disposition"), `attachment; filename="dune-audio.${format}"`);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), expectedBytes);
      assert.deepEqual(JSON.parse(JSON.stringify(api.calls[0].body)), {
        model: "custom-speech-model", input: "Hello from Dune.", voice: "cedar", response_format: format, speed: 0.75, instructions: "Speak warmly.",
      });
      assert.equal(api.calls[0].request.maxRetries, 0);
      assert.equal(api.calls[0].request.timeout, 60_000);
    });
  }
  const api = harness();
  await api.audio(request("audio", { input: "Hello", instructions: "  " }));
  assert.deepEqual(JSON.parse(JSON.stringify(api.calls[0].body)), {
    model: "gpt-4o-mini-tts", input: "Hello", voice: "marin", response_format: "mp3", speed: 1,
  });
});

test("strict validation rejects invalid or injected settings before creating a client", async () => {
  const api = harness();
  const invalidImages = [null, [], {}, { prompt: " " }, { prompt: "x".repeat(4001) },
    { prompt: "Hello", size: "512x512" }, { prompt: "Hello", quality: "max" },
    { prompt: "Hello", model: "injected" }, { prompt: "Hello", n: 10 }];
  for (const body of invalidImages) await expectError(await api.image(request("image", body)), 400, "invalid_input");
  const invalidAudio = [{ input: " " }, { input: "x".repeat(4097) }, { input: "Hello", voice: "unknown" },
    { input: "Hello", format: "pcm" }, { input: "Hello", speed: "1" }, { input: "Hello", speed: 2 },
    { input: "Hello", instructions: "x".repeat(501) }, { input: "Hello", model: "injected" }];
  for (const body of invalidAudio) await expectError(await api.audio(request("audio", body)), 400, "invalid_input");
  assert.equal(api.clients.length, 0);
  assert.equal(api.calls.length, 0);
});

test("rejects foreign origins, malformed JSON, incorrect content types, and oversized advertised bodies", async () => {
  const api = harness();
  await expectError(await api.image(request("image", { prompt: "Hello" }, { headers: { Origin: "https://other.example" } })), 403, "origin_not_allowed");
  await expectError(await api.image(request("image", { prompt: "Hello" }, { headers: { Origin: "null" } })), 403, "origin_not_allowed");
  await expectError(await api.image(request("image", "{")), 400, "invalid_json");
  await expectError(await api.image(request("image", "{}", { headers: { "Content-Type": "text/plain" } })), 415, "unsupported_content_type");
  await expectError(await api.image(request("image", "{}", { headers: { "Content-Length": "32769" } })), 413, "body_too_large");
  assert.equal(api.calls.length, 0);
});

test("bounds streamed request bytes even with no Content-Length and cancels oversized readers", async () => {
  const api = harness();
  let cancelled = false;
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"prompt":"'));
      controller.enqueue(new TextEncoder().encode("😀".repeat(9000)));
    },
    cancel() { cancelled = true; },
  });
  await expectError(await api.image(request("image", body, { duplex: "half" })), 413, "body_too_large");
  assert.equal(cancelled, true);
  assert.equal(api.calls.length, 0);
});

test("provider failures return actionable sanitized errors without retries or leaked secrets", async (t) => {
  const cases = [
    [401, "invalid_api_key", 503, "provider_auth"],
    [403, "permission_denied", 503, "model_access"],
    [404, "model_not_found", 503, "model_access"],
    [429, "insufficient_quota", 503, "quota_exceeded"],
    [429, "rate_limit_exceeded", 429, "provider_rate_limit"],
    [400, "content_policy_violation", 422, "content_policy"],
    [400, "invalid_request", 422, "provider_rejected"],
    [500, "server_error", 503, "provider_unavailable"],
  ];
  for (const [status, code, expectedStatus, expectedCode] of cases) {
    await t.test(code, async () => {
      const api = harness({ image: async () => {
        throw new OpenAI.APIError(status, { code, message: `SENSITIVE_PROVIDER_MESSAGE ${secret}` }, "stack trace", new Headers());
      } });
      const response = await api.image(request("image", { prompt: "A garden" }));
      if (expectedStatus === 429) assert.equal(response.headers.get("retry-after"), "30");
      await expectError(response, expectedStatus, expectedCode);
      assert.equal(api.calls.length, 1);
    });
  }
});

test("connection errors and SDK timeouts remain sanitized", async (t) => {
  for (const [error, status, code] of [
    [new OpenAI.APIConnectionError({ message: secret }), 503, "provider_unavailable"],
    [new OpenAI.APIConnectionTimeoutError({ message: secret }), 504, "generation_timeout"],
    [new Error(secret), 502, "generation_failed"],
  ]) {
    await t.test(code, async () => {
      const api = harness({ audio: async () => { throw error; } });
      await expectError(await api.audio(request("audio", { input: "Hello" })), status, code);
      assert.equal(api.calls.length, 1);
    });
  }
});

test("empty or malformed successful provider responses cannot become downloads", async () => {
  for (const result of [{ data: [] }, { data: [{ b64_json: "not an image" }] }, { data: [{ b64_json: Buffer.from("plain text").toString("base64") }] }]) {
    const api = harness({ image: async () => result });
    await expectError(await api.image(request("image", { prompt: "A garden" })), 502, "invalid_provider_response");
    assert.equal(api.calls.length, 1);
  }
  const api = harness({ audio: async () => new Response(new Uint8Array()) });
  await expectError(await api.audio(request("audio", { input: "Hello" })), 502, "invalid_provider_response");
});

test("audio verifies MP3 and WAV signatures instead of trusting successful response headers", async () => {
  for (const [body, format] of [
    [JSON.stringify({ error: `SENSITIVE_PROVIDER_MESSAGE ${secret}` }), "mp3"],
    ["<!doctype html><html>upstream failure</html>", "mp3"],
    [speechBytes, "wav"],
    [wavBytes, "mp3"],
    ["RIFF....notWAVE", "wav"],
    ["ID3", "mp3"],
  ]) {
    const api = harness({ audio: async () => new Response(body, { headers: { "Content-Type": "audio/mpeg" } }) });
    await expectError(await api.audio(request("audio", { input: "Hello", format })), 502, "invalid_provider_response");
    assert.equal(api.calls.length, 1);
  }
  const frames = new Uint8Array([0xff, 0xfb, 0x90, 0x64, 0, 0, 0, 0]);
  const api = harness({ audio: async () => new Response(frames) });
  const response = await api.audio(request("audio", { input: "Hello" }));
  assert.equal(response.status, 200);
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), frames);
});

test("audio stops oversized response streams with and without Content-Length", async (t) => {
  for (const advertised of [false, true]) {
    await t.test(advertised ? "advertised size" : "streamed size", async () => {
      let cancelled = false;
      let chunksRead = 0;
      const chunk = new Uint8Array(1024 * 1024);
      chunk.set(new TextEncoder().encode("ID3"));
      const api = harness({ audio: async () => new Response(new ReadableStream({
        pull(controller) { chunksRead++; controller.enqueue(chunk); },
        cancel() { cancelled = true; },
      }), { headers: advertised ? { "Content-Length": String(32 * 1024 * 1024 + 1) } : {} }) });
      await expectError(await api.audio(request("audio", { input: "Hello" })), 502, "invalid_provider_response");
      assert.equal(cancelled, true);
      assert.ok(chunksRead <= 34, "The reader must stop as soon as the byte limit is exceeded");
      assert.equal(api.calls.length, 1);
    });
  }
});

test("a pre-cancelled request never contacts the SDK", async () => {
  const api = harness();
  const controller = new AbortController();
  controller.abort();
  await expectError(await api.image(request("image", { prompt: "A garden" }, { signal: controller.signal })), 499, "cancelled");
  assert.equal(api.calls.length, 0);
});

test("client cancellation aborts the SDK and releases the generation slot", async () => {
  let started;
  const ready = new Promise((resolve) => { started = resolve; });
  let callCount = 0;
  const followups = [];
  const api = harness({ image: (_, { signal }) => new Promise((resolve, reject) => {
    if (callCount++ > 0) {
      followups.push(resolve);
      return;
    }
    started();
    signal.addEventListener("abort", () => reject(new OpenAI.APIUserAbortError()), { once: true });
  }) });
  const controller = new AbortController();
  const response = api.image(request("image", { prompt: "A garden" }, { signal: controller.signal }));
  await ready;
  controller.abort();
  await expectError(await response, 499, "cancelled");
  assert.equal(api.calls[0].request.signal.aborted, true);
  const second = api.image(request("image", { prompt: "Second" }));
  const third = api.image(request("image", { prompt: "Third" }));
  await new Promise(setImmediate);
  assert.equal(followups.length, 2, "Cancellation must release its slot before follow-up requests");
  followups.forEach((resolve) => resolve(imageResult()));
  assert.equal((await second).status, 200);
  assert.equal((await third).status, 200);
});

test("client cancellation also closes an in-progress speech response body", async () => {
  let started;
  let cancelled = false;
  const ready = new Promise((resolve) => { started = resolve; });
  const api = harness({ audio: async () => new Response(new ReadableStream({
    pull() { started(); },
    cancel() { cancelled = true; },
  })) });
  const controller = new AbortController();
  const response = api.audio(request("audio", { input: "Hello" }, { signal: controller.signal }));
  await ready;
  controller.abort();
  await expectError(await response, 499, "cancelled");
  assert.equal(cancelled, true);
  assert.equal(api.calls[0].request.signal.aborted, true);
});

test("deadlines cover an unresponsive SDK and speech-body download", async (t) => {
  await t.test("image request", async () => {
    const api = harness({ timeoutMs: 5, image: () => new Promise(() => {}) });
    await expectError(await api.image(request("image", { prompt: "A garden" })), 504, "generation_timeout");
    assert.equal(api.calls[0].request.signal.aborted, true);
    assert.equal(api.calls.length, 1);
  });
  await t.test("audio response body", async () => {
    let cancelled = false;
    const api = harness({ timeoutMs: 5, audio: async () => new Response(new ReadableStream({
      cancel() { cancelled = true; },
    })) });
    await expectError(await api.audio(request("audio", { input: "Hello" })), 504, "generation_timeout");
    assert.equal(cancelled, true);
    assert.equal(api.calls[0].request.signal.aborted, true);
    assert.equal(api.calls.length, 1);
  });
});

test("process-local concurrency rejects extra work and permits work after completion", async () => {
  const pending = [];
  const api = harness({ image: () => new Promise((resolve) => pending.push(resolve)) });
  const first = api.image(request("image", { prompt: "First" }));
  const second = api.image(request("image", { prompt: "Second" }));
  await new Promise(setImmediate);
  assert.equal(pending.length, 2);
  const busy = await api.image(request("image", { prompt: "Third" }));
  assert.equal(busy.headers.get("retry-after"), "5");
  await expectError(busy, 429, "generation_busy");
  assert.equal(api.calls.length, 2);
  pending[0](imageResult());
  assert.equal((await first).status, 200);
  const fourth = api.image(request("image", { prompt: "Fourth" }));
  await new Promise(setImmediate);
  assert.equal(pending.length, 3);
  pending[1](imageResult());
  pending[2](imageResult());
  assert.equal((await second).status, 200);
  assert.equal((await fourth).status, 200);
});

test("process-local per-minute request limits expire without a cleanup timer", async () => {
  const api = harness();
  for (let index = 0; index < 8; index++) {
    assert.equal((await api.image(request("image", { prompt: `Garden ${index}` }))).status, 200);
  }
  const limited = await api.image(request("image", { prompt: "Another garden" }));
  assert.equal(limited.headers.get("retry-after"), "60");
  await expectError(limited, 429, "rate_limited");
  assert.equal(api.calls.length, 8);
  api.advance(60_001);
  assert.equal((await api.image(request("image", { prompt: "A later garden" }))).status, 200);
  assert.equal(api.calls.length, 9);
});
