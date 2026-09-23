const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const NodeModule = require("node:module");
const { after, test } = require("node:test");
const { JSDOM } = require("jsdom");
const ts = require("typescript");

// Install a DOM before loading React DOM so its event support detection is real.
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost", pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
for (const name of ["HTMLElement", "HTMLInputElement", "HTMLFormElement", "HTMLSelectElement", "Element", "Node", "DocumentFragment", "MutationObserver", "CustomEvent", "Event"]) {
  global[name] = dom.window[name];
}
global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
// jsdom has no layout or pointer capture; keep real Radix focus/portal behavior.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
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
const navigations = [];
const router = { push: (href) => navigations.push(href) };

// Render production components, including Markdown. Only Next routing is stubbed.
function loadProjectFile(relativePath) {
  const filename = path.resolve(projectRoot, relativePath);
  if (compiledModules.has(filename)) return compiledModules.get(filename).exports;
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const record = new NodeModule(filename);
  record.filename = filename;
  record.paths = NodeModule._nodeModulePaths(path.dirname(filename));
  const nativeRequire = record.require.bind(record);
  record.require = (specifier) => {
    if (specifier === "next/navigation") return { useRouter: () => router };
    if (specifier === "next/link") {
      return ({ href, children, ...props }) => React.createElement("a", { ...props, href }, children);
    }
    if (specifier.startsWith("@/")) {
      const base = specifier.slice(2);
      const resolved = [base, `${base}.tsx`, `${base}.ts`]
        .find((candidate) => fs.existsSync(path.join(projectRoot, candidate)));
      assert.ok(resolved, `Cannot resolve project module ${specifier}`);
      return loadProjectFile(resolved);
    }
    return nativeRequire(specifier);
  };
  compiledModules.set(filename, record);
  record._compile(compiled, filename);
  return record.exports;
}

const { ChatWorkspace } = loadProjectFile("components/chat/chat-workspace.tsx");

async function workspace(t, props = { mode: "conversation" }) {
  const requests = [];
  const copied = [];
  const originalFetch = global.fetch;
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  navigations.length = 0;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (text) => { copied.push(text); } },
  });
  // Intentionally ignore abort here: late transport completions must also be safe.
  global.fetch = (url, options) => new Promise((resolve, reject) => {
    requests.push({ url, ...options, resolve, reject });
  });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  t.after(async () => {
    await act(async () => root.unmount());
    container.remove();
    global.fetch = originalFetch;
    if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
    else delete navigator.clipboard;
  });
  await act(async () => root.render(React.createElement(ChatWorkspace, props)));

  const input = () => container.querySelector("textarea");
  const button = (label) => [...container.querySelectorAll("button")]
    .find((element) => element.getAttribute("aria-label") === label || element.textContent.trim() === label);
  const click = async (label) => {
    const element = button(label);
    assert.ok(element, `Expected button: ${label}`);
    await act(async () => element.click());
  };
  const type = async (value) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(input(), value);
      input().dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    });
  };
  const submit = async () => {
    await act(async () => container.querySelector("form").dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true }),
    ));
  };
  const key = async (options = {}) => {
    const event = new dom.window.KeyboardEvent("keydown", {
      key: "Enter", code: "Enter", bubbles: true, cancelable: true, ...options,
    });
    await act(async () => input().dispatchEvent(event));
    return event;
  };
  const respond = async (index, content) => {
    await act(async () => requests[index].resolve({
      ok: true,
      json: async () => ({ role: "assistant", content }),
    }));
  };
  const send = async (text) => { await type(text); await submit(); };
  const history = (index) => JSON.parse(requests[index].body).messages;
  const articles = () => [...container.querySelectorAll("article")];
  return { container, requests, copied, input, button, click, type, submit, key, respond, send, history, articles };
}

test("shows optimistic messages and chronological replies above the bottom composer, retaining follow-up history", async (t) => {
  const view = await workspace(t, { mode: "conversation", overview: true });
  assert.equal(view.button("Send message").disabled, true);
  assert.equal(view.container.querySelectorAll('nav[aria-label="Explore AI tools"] a').length, 5);

  await view.send("  Plan a weekend trip  ");
  assert.equal(view.requests.length, 1);
  assert.equal(view.requests[0].url, "/api/conversation");
  assert.deepEqual(view.history(0), [{ role: "user", content: "Plan a weekend trip" }]);
  assert.equal(view.input().value, "");
  assert.equal(view.articles().length, 1);
  assert.match(view.articles()[0].textContent, /Plan a weekend trip/);
  assert.match(view.container.querySelector('[role="status"]').textContent, /thinking/);
  const transcript = view.container.querySelector('[role="log"]');
  const composer = view.container.querySelector('form[aria-label="Message composer"]');
  assert.ok(transcript.compareDocumentPosition(composer) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);

  await view.respond(0, "Start with a train ride.");
  assert.deepEqual(view.articles().map((element) => element.getAttribute("aria-label")), ["Your message", "Dune AI response"]);
  assert.equal(view.button("Stop generating"), undefined);
  await view.send("Make it a two-day trip.");
  assert.deepEqual(view.history(1), [
    { role: "user", content: "Plan a weekend trip" },
    { role: "assistant", content: "Start with a train ride." },
    { role: "user", content: "Make it a two-day trip." },
  ]);
  await view.respond(1, "Spend the second day by the coast.");
  assert.deepEqual(view.articles().map((element) => element.getAttribute("aria-label")), [
    "Your message", "Dune AI response", "Your message", "Dune AI response",
  ]);
  assert.match(view.articles()[3].textContent, /second day by the coast/);
});

test("retries a failed request without duplicating the user message and regenerates only the last reply", async (t) => {
  const view = await workspace(t);
  await view.send("Help me get started.");
  await act(async () => view.requests[0].resolve({ ok: false, text: async () => "Service is busy. Try again shortly." }));
  assert.match(view.container.querySelector('[role="alert"]').textContent, /Service is busy/);
  assert.equal(view.articles().length, 1);

  await view.click("Try again");
  assert.equal(view.container.querySelector('[role="alert"]'), null);
  assert.deepEqual(view.history(1), view.history(0));
  assert.equal(view.articles().length, 1);
  await view.respond(1, "Choose one small first step.");
  await view.click("Regenerate response");
  assert.deepEqual(view.history(2), view.history(0));
  assert.equal(view.articles().length, 1);
  await view.respond(2, "Write down the goal first.");
  assert.equal(view.articles().length, 2);
  assert.match(view.articles()[1].textContent, /Write down the goal first/);
  assert.doesNotMatch(view.container.textContent, /Choose one small first step/);
});

test("Enter sends once, while Shift+Enter and IME composition do not submit", async (t) => {
  const view = await workspace(t);
  await view.type("A draft with multiple lines");
  assert.equal((await view.key({ shiftKey: true })).defaultPrevented, false);
  assert.equal((await view.key({ isComposing: true })).defaultPrevented, false);
  assert.equal(view.requests.length, 0);
  assert.equal(view.input().value, "A draft with multiple lines");
  assert.equal((await view.key()).defaultPrevented, true);
  assert.equal(view.requests.length, 1);
  await view.type("A second draft");
  await view.key();
  await view.submit();
  assert.equal(view.requests.length, 1);
  assert.equal(view.input().value, "A second draft");
  await view.respond(0, "Received.");
});

test("Stop immediately restores the composer and ignores a late response while a new request runs", async (t) => {
  const view = await workspace(t);
  await view.send("A long request");
  await view.click("Stop generating");
  assert.equal(view.requests[0].signal.aborted, true);
  assert.equal(view.button("Stop generating"), undefined);
  assert.ok(view.button("Send message"));
  assert.match(view.container.querySelector('[role="status"]').textContent, /Response stopped/);
  assert.equal(view.articles().length, 1);

  await view.send("Try a shorter answer");
  assert.equal(view.requests.length, 2);
  await view.respond(0, "This stale answer must never appear.");
  assert.ok(view.button("Stop generating"));
  assert.equal(view.articles().length, 2);
  assert.doesNotMatch(view.container.textContent, /stale answer/);
  await view.respond(1, "Here is the shorter answer.");
  assert.equal(view.articles().length, 3);
  assert.match(view.articles()[2].textContent, /shorter answer/);
});

test("New chat aborts the old request, clears history, focuses the composer, and ignores stale completions", async (t) => {
  const view = await workspace(t);
  await view.send("Old conversation");
  await view.type("An unsent draft");
  await view.click("New chat");
  assert.equal(view.requests[0].signal.aborted, true);
  assert.equal(view.articles().length, 0);
  assert.equal(view.input().value, "");
  assert.equal(document.activeElement, view.input());
  await view.send("New conversation");
  assert.deepEqual(view.history(1), [{ role: "user", content: "New conversation" }]);
  await view.respond(0, "An obsolete result");
  assert.ok(view.button("Stop generating"));
  assert.doesNotMatch(view.container.textContent, /obsolete result|Old conversation/);
  await view.respond(1, "A fresh answer");
  assert.equal(view.articles().length, 2);
  assert.match(view.articles()[1].textContent, /A fresh answer/);
});

test("suggestions populate the composer and the real Radix tool picker supports keyboard navigation", async (t) => {
  const view = await workspace(t);
  await view.click("Make a plan");
  assert.match(view.input().value, /realistic weekly plan/);
  assert.equal(document.activeElement, view.input());
  assert.equal(view.requests.length, 0);
  await act(async () => {
    const trigger = view.container.querySelector('[role="combobox"][aria-label="Choose AI tool"]');
    trigger.focus();
    trigger.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
  });
  const menu = document.querySelector('[role="listbox"]');
  assert.ok(menu, "Radix opens the options in a portal");
  assert.equal(view.container.contains(menu), false);
  const options = [...menu.querySelectorAll('[role="option"]')];
  assert.equal(options.length, 5);
  const codeOption = options.find((option) => option.textContent === "Code");
  assert.ok(codeOption);
  await act(async () => {
    codeOption.focus();
    codeOption.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  });
  assert.deepEqual(navigations, ["/code"]);
  assert.equal(document.querySelector('[role="listbox"]'), null);
});

test("Code renders formatted Markdown safely and copies the exact code or complete response", async (t) => {
  const view = await workspace(t, { mode: "code" });
  const code = 'const greeting = "Hello";\nconsole.log(greeting);';
  const markdown = [
    "## A clear answer", "", "Use **descriptive names** and `const`.", "",
    "- Keep it small", "- Make it readable", "",
    "| Item | Value |", "| --- | --- |", "| Language | JavaScript |", "",
    "[Reference](https://example.com/docs)", "", "[Unsafe](javascript:alert%281%29)", "",
    "<script>window.untrusted = true</script>", "",
    "```javascript", code, "```",
  ].join("\n");
  await view.send("Write a greeting");
  assert.equal(view.requests[0].url, "/api/code");
  await view.respond(0, markdown);

  const reply = view.articles()[1];
  assert.equal(reply.querySelector("h2").textContent, "A clear answer");
  assert.equal(reply.querySelector("strong").textContent, "descriptive names");
  assert.equal(reply.querySelectorAll("li").length, 2);
  assert.match(reply.querySelector("table").textContent, /JavaScript/);
  assert.equal(reply.querySelector("pre code").textContent, code);
  assert.equal(reply.querySelector("p code").textContent, "const");
  const reference = reply.querySelector('a[href="https://example.com/docs"]');
  assert.equal(reference.target, "_blank");
  assert.match(reference.rel, /noopener/);
  assert.match(reference.rel, /noreferrer/);
  assert.equal(reply.querySelector('a[href^="javascript:"]'), null);
  assert.equal(reply.querySelector("script"), null);

  await view.click("Copy code");
  assert.deepEqual(view.copied, [code]);
  assert.ok(view.button("Copied"));
  await view.click("Copy response");
  assert.deepEqual(view.copied, [code, markdown]);
});

test("clipboard rejection gives visible feedback without losing the response", async (t) => {
  const view = await workspace(t);
  await view.send("Say hello");
  await view.respond(0, "Hello there.");
  navigator.clipboard.writeText = async () => { throw new Error("Clipboard unavailable"); };
  await view.click("Copy response");
  assert.ok(view.button("Copy failed"));
  assert.match(view.articles()[1].textContent, /Hello there/);
});
