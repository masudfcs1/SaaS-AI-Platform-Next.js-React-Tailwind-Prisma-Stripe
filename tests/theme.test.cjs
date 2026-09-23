const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const NodeModule = require("node:module");
const { spawnSync } = require("node:child_process");
const ts = require("typescript");
const React = require("react");

const projectRoot = path.resolve(__dirname, "..");
const compiledModules = new Map();

// Keep the production provider, Radix primitives, and toggle in the test.
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

function themeTree() {
  const { ThemeProvider } = loadProjectFile("components/theme-provider.tsx");
  const { ModeToggle } = loadProjectFile("components/mode-toggle.tsx");
  return React.createElement(ThemeProvider, {
    attribute: "class",
    defaultTheme: "system",
    enableSystem: true,
    disableTransitionOnChange: true,
  }, React.createElement(ModeToggle));
}

if (process.argv.includes("--render-theme-ssr")) {
  // A fresh process has no window/localStorage, just like the Next server render.
  const { renderToString } = require("react-dom/server");
  process.stdout.write(renderToString(themeTree(), { identifierPrefix: "theme-test-" }));
} else {
  const { after, beforeEach, test } = require("node:test");
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true,
    runScripts: "outside-only",
  });

  global.window = dom.window;
  global.document = dom.window.document;
  for (const name of [
    "HTMLElement", "HTMLInputElement", "Element", "Node", "NodeFilter",
    "MutationObserver", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent",
  ]) global[name] = dom.window[name];
  global.localStorage = dom.window.localStorage;
  global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
  global.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(global, "navigator", { configurable: true, value: dom.window.navigator });

  // jsdom does not provide layout or pointer-capture browser APIs.
  dom.window.PointerEvent = dom.window.MouseEvent;
  global.PointerEvent = dom.window.PointerEvent;
  dom.window.HTMLElement.prototype.hasPointerCapture = () => false;
  dom.window.HTMLElement.prototype.setPointerCapture = () => {};
  dom.window.HTMLElement.prototype.releasePointerCapture = () => {};
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  dom.window.ResizeObserver = global.ResizeObserver;

  let systemDark = false;
  const mediaListeners = new Set();
  const darkQuery = "(prefers-color-scheme: dark)";
  dom.window.matchMedia = (query) => ({
    media: query,
    get matches() { return query === darkQuery && systemDark; },
    onchange: null,
    addListener(listener) { mediaListeners.add(listener); },
    removeListener(listener) { mediaListeners.delete(listener); },
    addEventListener(_event, listener) { mediaListeners.add(listener); },
    removeEventListener(_event, listener) { mediaListeners.delete(listener); },
    dispatchEvent() { return true; },
  });

  const { act } = React;
  // Load after the DOM is available so React/Radix detect browser event support.
  const { createRoot, hydrateRoot } = require("react-dom/client");
  const pause = () => new Promise((resolve) => setTimeout(resolve, 10));
  const settle = () => act(pause);

  beforeEach(() => {
    assert.equal(mediaListeners.size, 0, "The previous provider must unsubscribe from system changes");
    localStorage.clear();
    document.documentElement.removeAttribute("class");
    document.documentElement.removeAttribute("style");
    systemDark = false;
  });
  after(() => dom.window.close());

  async function setSystemTheme(isDark) {
    await act(async () => {
      systemDark = isDark;
      for (const listener of [...mediaListeners]) listener({ matches: isDark, media: darkQuery });
    });
    await settle();
  }

  function assertTheme(theme) {
    assert.equal(document.documentElement.classList.contains(theme), true);
    assert.equal(document.documentElement.classList.contains(theme === "dark" ? "light" : "dark"), false);
    assert.equal(document.documentElement.style.colorScheme, theme);
  }

  async function mountTheme(t) {
    const container = document.createElement("div");
    document.body.append(container);
    let root = createRoot(container);
    t.after(async () => {
      await act(async () => root.unmount());
      await settle();
      container.remove();
    });
    const render = async () => {
      await act(async () => root.render(themeTree()));
      await settle();
    };
    await render();

    const trigger = () => container.querySelector('button[aria-haspopup="menu"]');
    const menu = () => document.querySelector('[role="menu"]');
    const item = (label) => [...document.querySelectorAll('[role="menuitemradio"]')]
      .find((element) => element.textContent.trim() === label);
    const key = async (element, value) => {
      await act(async () => element.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
        key: value, code: value, bubbles: true, cancelable: true,
      })));
      await settle();
    };
    const open = async () => {
      assert.ok(trigger(), "Expected the accessible theme dropdown trigger");
      await act(async () => trigger().dispatchEvent(new dom.window.PointerEvent("pointerdown", {
        button: 0, ctrlKey: false, bubbles: true, cancelable: true,
      })));
      await settle();
      assert.ok(menu(), "Expected the theme menu to open");
    };
    const choose = async (label) => {
      await open();
      assert.ok(item(label), `Expected the ${label} theme choice`);
      await act(async () => item(label).click());
      await settle();
      assert.equal(menu(), null, "Selecting a theme should dismiss the menu");
    };
    const remount = async () => {
      await act(async () => root.unmount());
      root = createRoot(container);
      await render();
    };
    return { container, trigger, menu, item, key, open, choose, remount };
  }

  test("defaults to the operating-system theme and exposes Light, Dark, and System choices", async (t) => {
    systemDark = true;
    const view = await mountTheme(t);
    assertTheme("dark");
    assert.equal(localStorage.getItem("theme"), null);
    await view.open();
    assert.deepEqual([...document.querySelectorAll('[role="menuitemradio"]')]
      .map((element) => element.textContent.trim()), ["Light", "Dark", "System"]);
    assert.equal(view.item("System").getAttribute("aria-checked"), "true");
    assert.equal(view.item("Dark").getAttribute("aria-checked"), "false");
    await view.key(view.menu(), "Escape");
    await setSystemTheme(false);
    assertTheme("light");
  });

  test("Light and Dark selections update the document, persist, and survive provider remounts", async (t) => {
    const view = await mountTheme(t);
    for (const [label, value] of [["Dark", "dark"], ["Light", "light"]]) {
      await view.choose(label);
      assertTheme(value);
      assert.equal(localStorage.getItem("theme"), value);
      await view.remount();
      assertTheme(value);
      await view.open();
      assert.equal(view.item(label).getAttribute("aria-checked"), "true");
      await view.key(view.menu(), "Escape");
    }
  });

  test("System follows live operating-system changes while an explicit theme remains fixed", async (t) => {
    const view = await mountTheme(t);
    await view.choose("Dark");
    await setSystemTheme(true);
    await setSystemTheme(false);
    assertTheme("dark");
    assert.equal(localStorage.getItem("theme"), "dark");

    await view.choose("System");
    assert.equal(localStorage.getItem("theme"), "system");
    assertTheme("light");
    await setSystemTheme(true);
    assertTheme("dark");
    await setSystemTheme(false);
    assertTheme("light");
    await view.remount();
    await setSystemTheme(true);
    assertTheme("dark");
    assert.equal(localStorage.getItem("theme"), "system");
  });

  test("the Radix menu opens, navigates, selects, and dismisses with the keyboard", async (t) => {
    const view = await mountTheme(t);
    assert.match(view.trigger().getAttribute("aria-label") || view.trigger().textContent, /theme/i);
    view.trigger().focus();
    await view.key(view.trigger(), "ArrowDown");
    assert.ok(view.menu());
    assert.equal(document.activeElement, view.item("Light"));
    await view.key(document.activeElement, "ArrowDown");
    assert.equal(document.activeElement, view.item("Dark"));
    await view.key(document.activeElement, "Enter");
    assertTheme("dark");
    assert.equal(localStorage.getItem("theme"), "dark");
    assert.equal(view.menu(), null);
    assert.equal(document.activeElement, view.trigger());

    await view.key(view.trigger(), "ArrowDown");
    assert.ok(view.menu());
    await view.key(document.activeElement, "Escape");
    assert.equal(view.menu(), null);
    assert.equal(document.activeElement, view.trigger());
  });

  test("server markup applies the persisted theme before hydration and hydrates without mismatches", async (t) => {
    localStorage.setItem("theme", "dark");
    const server = spawnSync(process.execPath, [__filename, "--render-theme-ssr"], {
      encoding: "utf8",
      timeout: 30000,
    });
    assert.equal(server.error, undefined);
    assert.equal(server.status, 0, server.stderr);
    const container = document.createElement("div");
    container.innerHTML = server.stdout;
    document.body.append(container);
    const initialization = container.querySelector("script");
    assert.ok(initialization, "The provider must render its theme initialization script");
    dom.window.eval(initialization.textContent);
    assertTheme("dark");

    const hydrationErrors = [];
    const consoleErrors = [];
    const originalError = console.error;
    let root;
    t.after(async () => {
      if (root) await act(async () => root.unmount());
      await settle();
      container.remove();
    });
    try {
      console.error = (...args) => consoleErrors.push(args.map(String).join(" "));
      await act(async () => {
        root = hydrateRoot(container, themeTree(), {
          identifierPrefix: "theme-test-",
          onRecoverableError: (error) => hydrationErrors.push(error.message),
        });
      });
      await settle();
    } finally {
      console.error = originalError;
    }
    assert.deepEqual(hydrationErrors, []);
    assert.deepEqual(consoleErrors, []);
    assertTheme("dark");
    assert.ok(container.querySelector('button[aria-haspopup="menu"]'));
  });
}
