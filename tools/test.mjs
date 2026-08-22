/**
 * Headless runner for the game's own self test.
 *
 *   node tools/test.mjs
 *
 * The game is a single HTML file with an inline script, so there is nothing to
 * import. This pulls the script out of index.html and evaluates it against a
 * stub DOM — just enough of one for the page to boot — then calls the
 * selfTest() defined in the page itself.
 *
 * The point is that the assertions live in index.html next to the code they
 * cover, and run identically here and at index.html?test=1. This file only
 * supplies an environment, plus the handful of checks that can only be made
 * from outside the page (does every file the service worker promises to cache
 * actually exist, does the icon art still match the generator, and so on).
 *
 * Exits non-zero on any failure.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/* ---------------- the smallest DOM that will boot the page ---------------- */

// Every canvas call is a no-op: with location.search set to ?test=1 the page
// skips its render loop, so nothing here is ever asked for a pixel.
const noopCtx = new Proxy(
  { canvas: null },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      return () => {};
    },
    set() { return true; },
  }
);

class El {
  constructor(tag = "div") {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this._cls = new Set();
    this.dataset = {};
    this.textContent = "";
    this.value = "";
    this.checked = false;
    this.disabled = false;
    this.onclick = null;
    this.width = 0;
    this.height = 0;
    const props = new Map();
    this.style = {
      setProperty: (k, v) => props.set(k, v),
      getPropertyValue: (k) => props.get(k) ?? "",
      removeProperty: (k) => props.delete(k),
      _props: props,
    };
    this.classList = {
      add: (...c) => c.forEach((x) => x && this._cls.add(x)),
      remove: (...c) => c.forEach((x) => this._cls.delete(x)),
      contains: (c) => this._cls.has(c),
      toggle: (c, force) => {
        const on = force === undefined ? !this._cls.has(c) : !!force;
        on ? this._cls.add(c) : this._cls.delete(c);
        return on;
      },
    };
  }
  get className() { return [...this._cls].join(" "); }
  set className(v) {
    this._cls = new Set(String(v).split(/\s+/).filter(Boolean));
  }
  getContext() { return noopCtx; }
  appendChild(c) { this.children.push(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); }
  addEventListener() {}
  removeEventListener() {}
  focus() {}
  blur() {}
  getBoundingClientRect() {
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }
  /** Only class and tag selectors are ever used, and only to reach a child. */
  querySelector(sel) {
    const want = sel.replace(/^\./, "");
    const walk = (e) => {
      for (const c of e.children) {
        if (c._cls.has(want) || c.tagName === want.toUpperCase()) return c;
        const deep = walk(c);
        if (deep) return deep;
      }
      return null;
    };
    return walk(this) ?? new El(); // never null: the page chains off these
  }
  querySelectorAll() { return []; }
  /** Enough parsing to make the page's innerHTML snippets queryable. */
  set innerHTML(html) {
    this.children = [];
    if (!html) return;
    for (const m of String(html).matchAll(/<(\w+)([^>]*)>/g)) {
      const el = new El(m[1]);
      const cls = /class="([^"]*)"/.exec(m[2]);
      if (cls) el.className = cls[1];
      this.children.push(el);
    }
  }
  get innerHTML() { return ""; }
}

const byId = new Map();
const document = {
  body: new El("body"),
  documentElement: new El("html"),
  title: "",
  createElement: (t) => new El(t),
  getElementById(id) {
    if (!byId.has(id)) byId.set(id, new El());
    return byId.get(id);
  },
  querySelector: () => new El(),
  querySelectorAll: () => [],
  addEventListener: () => {},
};

const storage = new Map();
const localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
  get length() { return storage.size; },
};

const sandbox = {
  document,
  localStorage,
  // ?test=1 keeps boot off the render loop and off registering a worker.
  location: { search: "?test=1", href: "http://localhost:8123/index.html" },
  navigator: { userAgent: "node", language: "en-US" },
  innerWidth: 1280,
  innerHeight: 900,
  devicePixelRatio: 1,
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  getComputedStyle: (el) => ({
    getPropertyValue: (k) => el?.style?.getPropertyValue(k) ?? "",
  }),
  setTimeout, clearTimeout, setInterval, clearInterval,
  console, Math, Date, JSON, performance,
  Set, Map, Array, Object, String, Number, Boolean, Promise, Error,
  parseFloat, parseInt, isNaN, structuredClone,
  URLSearchParams, TextEncoder, TextDecoder, Uint8Array,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

/* ---------------- boot the page and run its suite ------------------------- */

const html = read("index.html");
const script = /<script>([\s\S]*)<\/script>/.exec(html);
if (!script) {
  console.error("could not find the inline <script> in index.html");
  process.exit(1);
}

const ctx = vm.createContext(sandbox);
try {
  new vm.Script(script[1], { filename: "index.html" }).runInContext(ctx);
} catch (e) {
  console.error("the page threw while booting:\n" + ((e && e.stack) || e));
  process.exit(1);
}

if (typeof ctx.selfTest !== "function") {
  console.error("index.html does not expose selfTest() on globalThis");
  process.exit(1);
}

const results = ctx.selfTest();

/* ------ checks that can only be made from outside the page ---------------- */

// The page cannot read its own sibling files, so the packaging invariants —
// the ones that break offline play or an install prompt without breaking
// anything a browser would notice locally — are asserted here instead.
function outside(name, fn) {
  try {
    results.push({ name, pass: true, detail: fn() || "" });
  } catch (e) {
    results.push({ name, pass: false, detail: (e && e.message) || String(e) });
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const sw = read("sw.js");
// Read straight out of the source rather than importing it: sw.js is a
// service-worker script and importing it would need a worker global scope.
const cacheFiles = [
  ...(/const CACHE_FILES = \[([\s\S]*?)\];/.exec(sw)[1].matchAll(/'([^']+)'/g)),
].map((m) => m[1]);

outside("every file the service worker caches exists on disk", () => {
  for (const f of cacheFiles) {
    assert(existsSync(join(root, f)), f + " is listed in CACHE_FILES but not in the repo");
  }
  return cacheFiles.length + " files";
});

outside("no cached path carries a query string or leaves the app", () => {
  for (const f of cacheFiles) {
    assert(f.startsWith("./"), f + " should be relative to the app scope");
    assert(!f.includes("?"), f + " carries a query string, which never matches on lookup");
  }
  return "all " + cacheFiles.length + " relative";
});

const manifest = JSON.parse(read("manifest.json"));

outside("every icon the manifest advertises exists and is cached", () => {
  const pngs = manifest.icons.filter((i) => i.type === "image/png");
  assert(pngs.length >= 3, "expected at least 192, 512 and a maskable PNG");
  for (const icon of pngs) {
    assert(existsSync(join(root, icon.src)), icon.src + " is in the manifest but not in the repo");
    assert(
      cacheFiles.includes("./" + icon.src),
      icon.src + " is in the manifest but missing from CACHE_FILES, so it will not be there offline"
    );
  }
  assert(
    manifest.icons.some((i) => i.purpose === "maskable"),
    "no maskable icon: Android will crop the square one into a circle"
  );
  return pngs.length + " PNG icons";
});

outside("the manifest declares screenshots for the install prompt", () => {
  const shots = manifest.screenshots || [];
  assert(shots.length >= 2, "expected a wide and a narrow screenshot");
  assert(shots.some((s) => s.form_factor === "wide"), "no wide screenshot");
  assert(shots.some((s) => s.form_factor === "narrow"), "no narrow screenshot");
  for (const s of shots) {
    assert(existsSync(join(root, s.src)), s.src + " is in the manifest but not in the repo");
  }
  return shots.length + " screenshots";
});

outside("the apple-touch-icon the page links actually exists", () => {
  const m = /<link rel="apple-touch-icon" href="([^"]+)"/.exec(html);
  assert(m, "index.html has no apple-touch-icon link, so iOS gets a screenshot instead");
  assert(existsSync(join(root, m[1])), m[1] + " is linked but not in the repo");
  return m[1];
});

outside("the viewport does not lock zoom", () => {
  const m = /<meta name="viewport" content="([^"]+)"/.exec(html);
  assert(m, "no viewport meta");
  assert(!/user-scalable\s*=\s*no/.test(m[1]), "user-scalable=no fails WCAG 1.4.4");
  assert(!/maximum-scale/.test(m[1]), "maximum-scale caps pinch zoom");
  assert(/viewport-fit=cover/.test(m[1]), "no viewport-fit=cover, so safe-area insets resolve to 0");
  return m[1];
});

outside("the icon generator still matches icon.svg", () => {
  // The generator duplicates the art rather than parsing the SVG. That is a
  // deliberate trade (a general SVG parser would dwarf the icon), so this is
  // the check that stops the two copies drifting apart unnoticed.
  const svg = read("icon.svg");
  const gen = read("tools/make-icons.mjs");
  const path = /<path d="([^"]+)"/.exec(svg)[1];
  assert(gen.includes(path), "the bolt path in tools/make-icons.mjs no longer matches icon.svg");
  for (const hex of ["#0a0e17", "#24344a", "#f5b942"]) {
    assert(svg.includes(hex), hex + " is no longer in icon.svg");
    assert(gen.includes(hex), hex + " is no longer in tools/make-icons.mjs");
  }
  return "path and 3 colours agree";
});

outside("the version string the build script reads is still parseable", () => {
  // tools/build.ps1 names the zip from this, so a reworded credit line would
  // silently produce a zip called wired-.zip.
  const m = /<div id="settingsCredits">v(\d+\.\d+(?:\.\d+)?)/.exec(html);
  assert(m, "could not find a version in the #settingsCredits line of index.html");
  return "v" + m[1];
});

/* -------------------------------- report ---------------------------------- */

console.log("Wired — in-page suite plus packaging checks, headless\n");
let fails = 0;
for (const r of results) {
  if (!r.pass) fails++;
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}`);
  if (r.detail) console.log(`        ${r.detail}`);
}
console.log();
console.log(fails ? `FAIL — ${fails} of ${results.length} checks` : `PASS — all ${results.length} checks`);
process.exit(fails ? 1 : 0);
