const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const NodeModule = require("node:module");
const { after, test } = require("node:test");
const { JSDOM } = require("jsdom");
const ts = require("typescript");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost", pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
for (const name of ["HTMLElement", "HTMLInputElement", "HTMLFormElement", "HTMLSelectElement", "Element", "Node", "DocumentFragment", "MutationObserver", "CustomEvent", "Event"]) global[name] = dom.window[name];
global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
global.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(global, "navigator", { configurable: true, value: dom.window.navigator });
dom.window.HTMLElement.prototype.scrollTo = function ({ top }) { this.scrollTop = top; };
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.HTMLElement.prototype.hasPointerCapture = () => false;
dom.window.HTMLElement.prototype.setPointerCapture = function () {};
dom.window.HTMLElement.prototype.releasePointerCapture = function () {};
after(() => dom.window.close());

const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");
const projectRoot = path.resolve(__dirname, "..");
const compiledModules = new Map();

// Render the real shadcn/Radix controls and Next Image; only network and blob URLs are replaced.
function loadProjectFile(relativePath) {
  const filename = path.resolve(projectRoot, relativePath);
  if (compiledModules.has(filename)) return compiledModules.get(filename).exports;
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const record = new NodeModule(filename);
  record.filename = filename;
  record.paths = NodeModule._nodeModulePaths(path.dirname(filename));
  const nativeRequire = record.require.bind(record);
  record.require = (specifier) => {
    if (specifier.startsWith("@/")) {
      const base = specifier.slice(2);
      const resolved = [base, `${base}.tsx`, `${base}.ts`].find((candidate) => fs.existsSync(path.join(projectRoot, candidate)));
      assert.ok(resolved, `Cannot resolve ${specifier}`);
      return loadProjectFile(resolved);
    }
    return nativeRequire(specifier);
  };
  compiledModules.set(filename, record);
  record._compile(compiled, filename);
  return record.exports;
}

const { MediaWorkspace } = loadProjectFile("components/media/media-workspace.tsx");

async function workspace(t, mode = "image") {
  const requests = [];
  const created = [];
  const revoked = [];
  const originalFetch = global.fetch;
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = (blob) => {
    const url = `blob:http://localhost/generated-${created.length + 1}`;
    created.push({ blob, url });
    return url;
  };
  URL.revokeObjectURL = (url) => revoked.push(url);
  // Ignore abort so stale transport/body completions also exercise the real guards.
  global.fetch = (url, options) => new Promise((resolve, reject) => requests.push({ url, ...options, resolve, reject }));
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  let mounted = true;
  async function unmount() {
    if (mounted) await act(async () => root.unmount());
    mounted = false;
  }
  t.after(async () => {
    await unmount();
    container.remove();
    global.fetch = originalFetch;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });
  await act(async () => root.render(React.createElement(MediaWorkspace, { mode })));
  const input = () => container.querySelector('textarea[id^="media-prompt"]');
  const button = (label) => [...container.querySelectorAll("button")].find((element) => element.getAttribute("aria-label") === label || element.textContent.trim() === label);
  const click = async (label) => {
    assert.ok(button(label), `Expected button: ${label}`);
    await act(async () => button(label).click());
  };
  const type = async (value, element = input()) => {
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value").set.call(element, value);
      element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    });
  };
  const submit = async () => act(async () => container.querySelector("form").dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })));
  const send = async (text) => { await type(text); await submit(); };
  const select = async (label, optionText) => {
    const trigger = [...container.querySelectorAll('[role="combobox"]')].find((element) => element.getAttribute("aria-label") === label);
    assert.ok(trigger, `Expected option: ${label}`);
    await act(async () => {
      trigger.focus();
      trigger.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    });
    const option = [...document.querySelectorAll('[role="option"]')].find((element) => element.textContent.includes(optionText));
    assert.ok(option, `Expected ${label} choice: ${optionText}`);
    await act(async () => {
      option.focus();
      option.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    });
  };
  const respond = async (index, type = "image/png", bytes = "generated binary") => {
    const blob = new Blob([bytes], { type });
    await act(async () => requests[index].resolve({ ok: true, blob: async () => blob }));
    return blob;
  };
  const fail = async (index, message) => act(async () => requests[index].resolve({ ok: false, json: async () => ({ error: message, code: "PROVIDER_ERROR" }) }));
  const payload = (index) => JSON.parse(requests[index].body);
  return { container, requests, created, revoked, input, button, click, type, submit, send, select, respond, fail, payload, unmount, root };
}

test("image generation submits default options, renders the actual binary preview above the composer, and downloads PNG", async (t) => {
  const view = await workspace(t);
  assert.equal(view.input().maxLength, 4000);
  assert.equal(view.button("Generate image").disabled, true);
  await view.send("  A ceramic cup in morning light  ");
  assert.equal(view.requests[0].url, "/api/image");
  assert.deepEqual(view.payload(0), { prompt: "A ceramic cup in morning light", size: "1024x1024", quality: "medium" });
  assert.equal(view.input().value, "");
  assert.match(view.container.querySelector('[role="status"]').textContent, /Creating your image/);
  assert.ok(view.container.querySelector("article").compareDocumentPosition(view.container.querySelector("form")) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
  const blob = await view.respond(0);
  assert.equal(view.created[0].blob, blob);
  const preview = view.container.querySelector("img");
  assert.equal(preview.src, view.created[0].url);
  assert.equal(preview.alt, "A ceramic cup in morning light");
  assert.equal(preview.width, 1024);
  assert.equal(preview.height, 1024);
  const download = view.container.querySelector("a[download]");
  assert.equal(download.href, view.created[0].url);
  assert.match(download.download, /^dune-image-.+\.png$/);
  assert.match(download.textContent, /Download PNG/);
  assert.equal(view.button("Stop waiting"), undefined);
});

test("image option changes are captured per request and multiple outputs stay chronological", async (t) => {
  const view = await workspace(t);
  await view.select("Aspect ratio", "Landscape");
  await view.select("Quality", "High");
  await view.send("A first landscape");
  assert.deepEqual(view.payload(0), { prompt: "A first landscape", size: "1536x1024", quality: "high" });
  await view.select("Aspect ratio", "Portrait");
  await view.respond(0);
  assert.equal(view.container.querySelector("img").width, 1536);
  await view.send("A second portrait");
  await view.respond(1);
  const articles = [...view.container.querySelectorAll("article")];
  assert.equal(articles.length, 2);
  assert.match(articles[0].textContent, /A first landscape/);
  assert.match(articles[1].textContent, /A second portrait/);
  assert.equal(articles[1].querySelector("img").height, 1536);
});

test("voice defaults generate MP3 audio with an AI disclosure, usable player, download, and transcript", async (t) => {
  const view = await workspace(t, "audio");
  assert.equal(view.input().maxLength, 4096);
  assert.match(view.container.textContent, /All voices are AI-generated/);
  await view.click("Welcome message");
  assert.match(view.input().value, /^Welcome/);
  assert.equal(view.requests.length, 0);
  await view.submit();
  assert.equal(view.requests[0].url, "/api/audio");
  assert.equal(view.payload(0).voice, "marin");
  assert.equal(view.payload(0).format, "mp3");
  assert.equal(view.payload(0).speed, 1);
  assert.equal("instructions" in view.payload(0), false);
  const blob = await view.respond(0, "audio/mpeg", "actual audio bytes");
  assert.equal(view.created[0].blob, blob);
  const player = view.container.querySelector("audio");
  assert.equal(player.controls, true);
  assert.equal(player.src, view.created[0].url);
  assert.equal(player.autoplay, false);
  assert.match(view.container.querySelector("article").textContent, /AI-generated voice/);
  assert.match(view.container.querySelector("details").textContent, /Welcome/);
  assert.match(view.container.querySelector("a[download]").download, /\.mp3$/);
});

test("voice, WAV format, numeric speed, and optional delivery instructions reach the audio API", async (t) => {
  const view = await workspace(t, "audio");
  await view.select("Voice", "Cedar");
  await view.select("Format", "WAV");
  await view.select("Speed", "1.25");
  await view.click("Voice direction");
  const direction = view.container.querySelector("#voice-instructions");
  assert.equal(direction.maxLength, 500);
  await view.type("  Warm and conversational.  ", direction);
  await view.send("  This is the exact script.  ");
  assert.deepEqual(view.payload(0), { input: "This is the exact script.", voice: "cedar", format: "wav", speed: 1.25, instructions: "Warm and conversational." });
  await view.respond(0, "audio/wav");
  assert.match(view.container.querySelector("a[download]").download, /\.wav$/);
  assert.match(view.container.querySelector("details").textContent, /Voice direction: Warm and conversational/);
});

test("retry uses the failed request's captured payload despite later edits and never duplicates its card", async (t) => {
  const view = await workspace(t);
  await view.send("An image to retry");
  await view.fail(0, "Image generation is busy. Please try again shortly.");
  assert.match(view.container.querySelector('[role="alert"]').textContent, /Please try again shortly/);
  await view.select("Quality", "Low");
  await view.type("A different draft");
  await view.click("Try again");
  assert.deepEqual(view.payload(1), view.payload(0));
  assert.equal(view.container.querySelectorAll("article").length, 1);
  assert.equal(view.input().value, "A different draft");
  await view.respond(1);
  assert.equal(view.container.querySelectorAll("article").length, 1);
  assert.equal(view.container.querySelector('[role="alert"]'), null);
});

test("Stop restores generation immediately and ignores stale binary data while a newer request runs", async (t) => {
  const view = await workspace(t);
  await view.send("An older generation");
  let finishBody;
  await act(async () => view.requests[0].resolve({ ok: true, blob: () => new Promise((resolve) => { finishBody = resolve; }) }));
  await view.click("Stop waiting");
  assert.equal(view.requests[0].signal.aborted, true);
  assert.ok(view.button("Generate image"));
  assert.match(view.container.querySelector('[role="status"]').textContent, /Stopped waiting/);
  await view.send("The current generation");
  await act(async () => finishBody(new Blob(["stale"], { type: "image/png" })));
  assert.equal(view.created.length, 0);
  assert.ok(view.button("Stop waiting"));
  await view.respond(1);
  assert.equal(view.created.length, 1);
  assert.equal(view.container.querySelectorAll("img").length, 1);
  assert.equal(view.container.querySelector("img").alt, "The current generation");
});

test("New session aborts work and revokes old URLs; unmount also revokes the next asset", async (t) => {
  const view = await workspace(t);
  await view.send("An existing image");
  await view.respond(0);
  const oldUrl = view.created[0].url;
  await view.send("A request still pending");
  await view.click("New session");
  assert.equal(view.requests[1].signal.aborted, true);
  assert.deepEqual(view.revoked, [oldUrl]);
  assert.equal(view.container.querySelectorAll("article").length, 0);
  assert.equal(view.input().value, "");
  assert.equal(document.activeElement, view.input());
  await view.respond(1);
  assert.equal(view.created.length, 1);
  await view.send("A new session image");
  await view.respond(2);
  await view.unmount();
  assert.deepEqual(view.revoked, [oldUrl, view.created[1].url]);
});

test("unmount and mode changes abort pending generation and prevent stale assets", async (t) => {
  const view = await workspace(t);
  await view.send("An image before switching tools");
  await act(async () => view.root.render(React.createElement(MediaWorkspace, { mode: "audio" })));
  assert.equal(view.requests[0].signal.aborted, true);
  assert.ok(view.button("Generate voice"));
  await view.respond(0);
  assert.equal(view.created.length, 0);
  await view.send("A script before leaving");
  await view.unmount();
  assert.equal(view.requests[1].signal.aborted, true);
  await view.respond(1, "audio/mpeg");
  assert.equal(view.created.length, 0);
});

test("empty or unexpected binary responses show an error instead of a broken preview", async (t) => {
  const view = await workspace(t);
  await view.send("Generate something");
  await view.respond(0, "image/png", "");
  assert.match(view.container.querySelector('[role="alert"]').textContent, /could not be opened/);
  assert.equal(view.created.length, 0);
  await view.click("Try again");
  await view.respond(1, "application/json", '{"error":"bad response"}');
  assert.equal(view.created.length, 0);
  assert.equal(view.container.querySelector("img"), null);
});

test("empty and overlong prompts cannot submit, and keyboard composition never starts generation", async (t) => {
  const view = await workspace(t, "audio");
  await view.submit();
  assert.equal(view.requests.length, 0);
  await view.type("x".repeat(4097));
  assert.equal(view.button("Generate voice").disabled, true);
  await view.submit();
  assert.equal(view.requests.length, 0);
  await view.type("A short script");
  for (const options of [{ shiftKey: true }, { isComposing: true }]) {
    const event = new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, ...options });
    await act(async () => view.input().dispatchEvent(event));
    assert.equal(event.defaultPrevented, false);
  }
  assert.equal(view.requests.length, 0);
  await act(async () => view.input().dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
  assert.equal(view.requests.length, 1);
  await view.type("Another script");
  await view.submit();
  assert.equal(view.requests.length, 1);
  await view.respond(0, "audio/mpeg");
});
