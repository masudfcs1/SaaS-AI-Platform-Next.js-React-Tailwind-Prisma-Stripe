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
for (const name of ["HTMLElement", "Element", "Node", "Event", "KeyboardEvent", "MouseEvent"]) global[name] = dom.window[name];
global.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(global, "navigator", { configurable: true, value: dom.window.navigator });
after(() => dom.window.close());

const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");
const projectRoot = path.resolve(__dirname, "..");
const compiledModules = new Map();

// Keep the actual preview and shadcn Button. Next routing is unnecessary for these local links.
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
    if (specifier === "next/link") return { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) };
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

const { LandingPreview } = loadProjectFile("components/landing-preview.tsx");

async function preview(t, desktop = false) {
  const listeners = new Set();
  const media = { matches: desktop, addEventListener: (_, listener) => listeners.add(listener), removeEventListener: (_, listener) => listeners.delete(listener) };
  window.matchMedia = () => media;
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(LandingPreview)));
  t.after(async () => { await act(async () => root.unmount()); container.remove(); assert.equal(listeners.size, 0); });
  const tabs = () => [...container.querySelectorAll('[role="tab"]')];
  const selected = () => container.querySelector('[role="tab"][aria-selected="true"]');
  const key = async (key) => act(async () => {
    selected().focus();
    selected().dispatchEvent(new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });
  const assertSelection = (index, href) => {
    const allTabs = tabs();
    assert.equal(selected(), allTabs[index]);
    assert.equal(allTabs.filter((tab) => tab.tabIndex === 0).length, 1);
    const panel = document.getElementById(selected().getAttribute("aria-controls"));
    assert.equal(panel.hidden, false);
    assert.equal(panel.getAttribute("aria-labelledby"), selected().id);
    assert.equal(container.querySelectorAll('[role="tabpanel"]:not([hidden])').length, 1);
    assert.equal(container.querySelector("a").getAttribute("href"), href);
    assert.equal(container.querySelector("a").textContent.trim(), `Try ${selected().textContent.trim()}`);
  };
  return { container, tabs, selected, key, assertSelection, resize: async (matches) => act(async () => { media.matches = matches; listeners.forEach((listener) => listener()); }) };
}

test("mobile preview tabs support arrow navigation, wrapping, Home and End with one focus target", async (t) => {
  const view = await preview(t);
  assert.equal(view.container.querySelector('[role="tablist"]').getAttribute("aria-orientation"), "horizontal");
  view.assertSelection(0, "/conversation");
  await view.key("ArrowRight");
  view.assertSelection(1, "/code");
  assert.equal(document.activeElement, view.selected());
  await view.key("End");
  view.assertSelection(3, "/audio");
  await view.key("ArrowRight");
  view.assertSelection(0, "/conversation");
  await view.key("ArrowLeft");
  view.assertSelection(3, "/audio");
  await view.key("Home");
  view.assertSelection(0, "/conversation");
});

test("desktop preview uses vertical keyboard navigation and updates when the layout changes", async (t) => {
  const view = await preview(t, true);
  assert.equal(view.container.querySelector('[role="tablist"]').getAttribute("aria-orientation"), "vertical");
  await view.key("ArrowDown");
  view.assertSelection(1, "/code");
  await view.key("ArrowUp");
  view.assertSelection(0, "/conversation");
  await view.resize(false);
  assert.equal(view.container.querySelector('[role="tablist"]').getAttribute("aria-orientation"), "horizontal");
  await view.key("ArrowRight");
  view.assertSelection(1, "/code");
});

test("pointer selection opens the matching tool and media examples are explicitly illustrative", async (t) => {
  const view = await preview(t);
  await act(async () => view.tabs()[2].click());
  view.assertSelection(2, "/image");
  const imagePanel = document.getElementById(view.selected().getAttribute("aria-controls"));
  assert.match(imagePanel.textContent, /Concept illustration/);
  assert.ok(imagePanel.querySelector('svg[role="img"][aria-label]'));
  await act(async () => view.tabs()[3].click());
  view.assertSelection(3, "/audio");
  const audioPanel = document.getElementById(view.selected().getAttribute("aria-controls"));
  assert.match(audioPanel.textContent, /Illustrative waveform/);
  assert.equal(audioPanel.querySelector("audio, video, button"), null);
});
