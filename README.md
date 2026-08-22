# Wired

**Connect every pair. Dodge the current. Race the clock.**

A real-time circuit-wiring puzzle that never rolls a die. Every spark's path,
every board, every tick of the clock is fixed and repeatable — the only
variable in the room is you.

Wired is a single HTML file. Open it and it runs: no install, no build step, no
server, no account, no network requests. Add it to a phone's home screen and it
works offline.

---

## How to play

Drag from a coloured dot to its matching dot — or tap your way there cell by
cell — to wire every pair together. **No two paths may cross.**

Sparks patrol fixed, repeating tracks that are always drawn on the board. Touch
an unfinished wire with a spark and it shorts out, costing you **+3 seconds**.
Once a wire is finished it is insulated, and safe for good.

Your score is **solve time + 3s per short**, so precision counts as much as
speed. The clock does not start until your first move, so plan as long as you
like before you touch anything.

**Trace** shows exactly where every spark will be one, two and three seconds
from now. It is free and unlimited — the only thing it costs is the time on the
clock once you have already started.

### Controls

| | |
|---|---|
| **Touch** | Drag from a dot along a path, or tap cell by cell |
| **Mouse** | Click and drag, or click cell by cell |
| **Keyboard** | `Tab` / `Shift+Tab` pick a wire · arrows or `WASD` extend it one cell · `Backspace` steps back · `Enter` / `Space` grabs a wire when none is selected |

## What's in it

- Three hand-authored levels, each solvable by construction — every pair runs
  down its own column, so no wire can block another and the challenge is purely
  timing.
- A **daily challenge** generated from the local date, so everyone gets the same
  board on a given day, with a streak counter. No server involved.
- **Medals** — gold, silver and bronze time cutoffs per level.
- **Challenge links** that encode the level and your score in the URL itself, so
  sharing a score needs no backend.
- **Cosmetic skins**, unlocked by play and purely visual — a skin may only set
  CSS custom properties, never anything the simulation reads, so every time
  stays comparable. The test suite enforces that.
- **Accessibility**: colourblind mode (wire pairs differ by shape and dash
  pattern, not only hue), reduce motion, and mute.

## Running it

Just open `index.html`.

For anything involving the service worker — offline play, the install prompt —
it has to be served over HTTP, because service workers do not run on `file://`:

```bash
python -m http.server 8123
```

Then visit `http://localhost:8123/`.

## Tests

Assertions live in `index.html` next to the code they cover, and run from that
one definition in two places:

```bash
node tools/test.mjs
```

...or open `index.html?test=1` in a browser to see the same suite rendered over
the page. The Node runner adds the checks that can only be made from outside the
page — that every file the service worker promises to cache exists, that the
manifest's icons are real and are cached, that the viewport doesn't lock zoom,
and that the icon generator still agrees with `icon.svg`.

`?test=1` deliberately skips the render loop and does not register a service
worker.

## Building a release

```powershell
.\tools\build.ps1
```

Runs the tests, then writes `dist/wired-v<version>.zip` with `index.html` at the
root of the archive — itch.io looks for it there and rejects the upload if it is
nested in a folder. The version comes from the About panel's credit line in
`index.html`, so the download and the in-game version cannot disagree.

Regenerating art, when `icon.svg` or the UI changes:

```bash
node tools/make-icons.mjs
node tools/make-screenshots.mjs
```

`make-icons.mjs` rasterises the app icons; `make-screenshots.mjs` drives an
installed Chrome or Edge to capture the store and manifest screenshots at their
exact required sizes. Both write into the repo; commit what they produce.

After adding or removing any shipped file, add it to `CACHE_FILES` in `sw.js`
and bump `CACHE_NAME`. `node tools/test.mjs` fails if a cached path doesn't
exist, but nothing can detect a file you forgot to list — so the habit matters.

## Dependencies

**Wired has none, and adding one needs a reason written down here first.**

That is not asceticism for its own sake. The whole product promise is that this
is one file you can open, email, or drop on any host, and it will run offline
forever. A runtime dependency breaks that outright. A *build* dependency breaks
something subtler: the ability to come back in two years, clone the repo, and
have it still build without hunting a dead package version.

So the tooling goes the long way around on purpose:

| Job | Obvious tool | What's used instead | Why |
|---|---|---|---|
| Rasterise icons | `sharp`, `canvas`, ImageMagick | `tools/make-icons.mjs` — scanline fill plus `node:zlib` | Four flat shapes; a PNG encoder is ~100 lines |
| Screenshots | Playwright, Puppeteer | `tools/make-screenshots.mjs` — CDP over Node 22+'s global `WebSocket` | Chrome is already installed; the protocol is the same one Playwright speaks |
| Zip | `zip`, `archiver` | `Compress-Archive` | Ships with Windows PowerShell |
| Tests | Jest, Vitest | `tools/test.mjs` — `node:vm` plus a stub DOM | The assertions live in the page; this only supplies an environment |

Each of those is a deliberate trade of a few dozen lines of local code against a
dependency tree. If a future job makes that trade clearly wrong — real SVG
parsing, image diffing, a bundler — the answer may genuinely be to take the
dependency. Add a row to this table saying which job and why, then take it.

**Two things this rule does not cover**, because they are not dependencies:
Chrome or Edge must be installed for `make-screenshots.mjs`, and Windows
PowerShell for `build.ps1`. Both are already on the machine; neither is
installed, versioned, or vendored by this repo.

## Layout

```
index.html                  the whole game, plus its own test suite
manifest.json               PWA metadata: icons, screenshots, display mode
sw.js                       cache-first service worker for offline play
icon.svg                    source art for every icon
icons/                      generated PNGs (make-icons.mjs)
screenshots/                generated store + manifest images (make-screenshots.mjs)
tools/
  test.mjs                  headless runner + packaging checks
  build.ps1                 release zip
  make-icons.mjs            icon rasteriser
  make-screenshots.mjs      scripted screenshot capture
ITCH-IO-PAGE.md             copy for the itch.io listing
```

## Publishing

See `ITCH-IO-PAGE.md` for the store copy. In short: build the zip, upload it to
itch.io as an HTML project with "This file will be played in the browser"
ticked, and put the same files on a static host for the installable PWA — the
install prompt does not fire inside itch.io's iframe, and that is expected.

## Licence

Proprietary — see [LICENSE](LICENSE). Wired grew out of an earlier puzzle,
Cut & Fill.
