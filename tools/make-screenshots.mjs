/**
 * Captures the store and manifest screenshots at their exact required sizes.
 *
 *   node tools/make-screenshots.mjs
 *
 * Drives an already-installed Chrome or Edge over the DevTools protocol. Node
 * 22+ ships a global WebSocket and node:http serves the files, so this adds no
 * dependency — same rule as tools/make-icons.mjs (see README, "Dependencies").
 *
 * Shots are scripted rather than hand-captured so a UI change can be re-shot in
 * one command, and so the sizes the manifest and itch.io ask for can't drift.
 */

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const OUT = join(root, "screenshots");
const PORT = 8271;
const DEBUG_PORT = 9333;

/* ------------------------------- the shots -------------------------------- */

// `act` runs after the intro has finished and before the capture.
const SHOTS = [
  { file: "wide-menu.png",     w: 1280, h: 720,  act: null,       note: "manifest wide + itch.io" },
  { file: "wide-play.png",     w: 1280, h: 720,  act: "play",     note: "itch.io" },
  { file: "wide-settings.png", w: 1280, h: 720,  act: "settings", note: "itch.io" },
  { file: "narrow-play.png",   w: 412,  h: 915,  act: "play",     note: "manifest narrow" },
  // The title screen runs 4200ms; grabbing it at 3200ms catches the wordmark,
  // the bolt and the tagline all fully in, before the auto-dismiss.
  { file: "cover-630x500.png", w: 630,  h: 500,  act: null, holdIntro: 3200, note: "itch.io cover" },
];

const INTRO_MS = 4600; // 4200ms intro + 200ms fade + slack

/* ------------------------------ static server ----------------------------- */

const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".json": "application/manifest+json",
  ".svg": "image/svg+xml", ".png": "image/png",
};

function serve() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split("?")[0]);
      const path = join(root, normalize(rel === "/" ? "/index.html" : rel));
      // Never serve outside the repo, even though this only ever listens on
      // loopback for a few seconds.
      if (!path.startsWith(root) || !existsSync(path)) {
        res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
      res.end(readFileSync(path));
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

/* --------------------------------- browser -------------------------------- */

const BROWSERS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch() {
  const exe = BROWSERS.find((p) => existsSync(p));
  if (!exe) throw new Error("no Chrome or Edge found in the usual install locations");

  // A throwaway profile: never touch the real one.
  const profile = mkdtempSync(join(tmpdir(), "wired-shots-"));
  const child = spawn(exe, [
    "--headless=new",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu",
    "--hide-scrollbars", "--force-device-scale-factor=1",
    "about:blank",
  ], { stdio: "ignore" });

  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      const v = await r.json();
      return { child, profile, exe, wsUrl: v.webSocketDebuggerUrl };
    } catch { await sleep(100); }
  }
  child.kill();
  throw new Error("the browser never opened its debugging port");
}

/** Minimal CDP client: request/response by id, plus event listeners. */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        for (const l of this.listeners) l(msg);
      }
    });
  }
  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.addEventListener("open", () => resolve(new CDP(ws)));
      ws.addEventListener("error", () => reject(new Error("could not attach to the browser")));
    });
  }
  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }
  once(method, sessionId) {
    return new Promise((resolve) => {
      const l = (msg) => {
        if (msg.method === method && (!sessionId || msg.sessionId === sessionId)) {
          this.listeners = this.listeners.filter((x) => x !== l);
          resolve(msg.params);
        }
      };
      this.listeners.push(l);
    });
  }
}

/* ------------------------------ interactions ------------------------------ */

async function click(cdp, sid, x, y) {
  const base = { x: Math.round(x), y: Math.round(y), button: "left", clickCount: 1 };
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", ...base }, sid);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...base }, sid);
}

async function evaluate(cdp, sid, expression) {
  const r = await cdp.send("Runtime.evaluate", { expression, returnByValue: true }, sid);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
}

/** Clicks the first level's Play button, then drags a wire partway down. */
async function actPlay(cdp, sid) {
  const btn = await evaluate(cdp, sid, `(() => {
    const cards = [...document.querySelectorAll('.levelCard')];
    const card = cards.find(c => !c.classList.contains('dailyCard')) || cards[0];
    const r = card.querySelector('.playBtn').getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  })()`);
  await click(cdp, sid, btn.x, btn.y);
  await sleep(400);

  // Drag the first pair's wire three cells down its column, so the shot shows
  // work in progress rather than an untouched board.
  const board = await evaluate(cdp, sid, `(() => {
    const r = document.getElementById('board').getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  })()`);
  const cols = 6, rows = 6;               // level 1 is 6x6
  const cw = board.w / cols, ch = board.h / rows;
  const at = (c, r) => ({ x: board.x + (c + 0.5) * cw, y: board.y + (r + 0.5) * ch });

  const start = at(0, 0);
  await cdp.send("Input.dispatchMouseEvent",
    { type: "mousePressed", x: Math.round(start.x), y: Math.round(start.y), button: "left", clickCount: 1 }, sid);
  const mid = at(0, 1);
  await cdp.send("Input.dispatchMouseEvent",
    { type: "mouseMoved", x: Math.round(mid.x), y: Math.round(mid.y), button: "left" }, sid);
  await sleep(120);
  await cdp.send("Input.dispatchMouseEvent",
    { type: "mouseReleased", x: Math.round(mid.x), y: Math.round(mid.y), button: "left", clickCount: 1 }, sid);
  await sleep(200);

  // Trace is free, unlimited and lasts 2.5s — long enough to capture, and it
  // shows the spark predictions that make the board read as a timing puzzle.
  const trace = await evaluate(cdp, sid, `(() => {
    const r = document.getElementById('previewBtn').getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  })()`);
  await click(cdp, sid, trace.x, trace.y);
  await sleep(350);
}

async function actSettings(cdp, sid) {
  const btn = await evaluate(cdp, sid, `(() => {
    const r = document.getElementById('settingsBtn').getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  })()`);
  await click(cdp, sid, btn.x, btn.y);
  await sleep(400);
}

/* ---------------------------------- main ---------------------------------- */

const server = await serve();
const { child, profile, exe, wsUrl } = await launch();
const cdp = await CDP.connect(wsUrl);
mkdirSync(OUT, { recursive: true });

console.log(`Using ${exe.split("/").pop()}\n`);

try {
  for (const shot of SHOTS) {
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);
    await cdp.send("Emulation.setDeviceMetricsOverride",
      { width: shot.w, height: shot.h, deviceScaleFactor: 1, mobile: false }, sessionId);

    const loaded = cdp.once("Page.loadEventFired", sessionId);
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` }, sessionId);
    await loaded;

    if (shot.holdIntro) {
      await sleep(shot.holdIntro);
      await evaluate(cdp, sessionId,
        "document.getElementById('introSkipHint').style.display = 'none'");
    } else {
      await sleep(INTRO_MS);
      if (shot.act === "play") await actPlay(cdp, sessionId);
      if (shot.act === "settings") await actSettings(cdp, sessionId);
    }

    const { data } = await cdp.send("Page.captureScreenshot", { format: "png" }, sessionId);
    const buf = Buffer.from(data, "base64");
    writeFileSync(join(OUT, shot.file), buf);
    console.log(`  ${shot.file.padEnd(22)} ${shot.w}×${shot.h}  ${buf.length} bytes  (${shot.note})`);

    await cdp.send("Target.closeTarget", { targetId });
  }
  console.log(`\nWrote ${SHOTS.length} screenshots to screenshots/.`);
} finally {
  cdp.ws.close();
  child.kill();
  server.close();
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
