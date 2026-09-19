# Dead Short — architecture and editing guide

The orientation layer. `CODE-MAP.md` says *where* things are; this says *what shape*
they are and *what to touch* for a given change. It is hand-written and deliberately
names shapes rather than line numbers, so it does not rot when the file moves around.

| doc | job | maintained by |
|---|---|---|
| `README.md` | Design doc — the rules and their reasoning | hand |
| `CLAUDE.md` | What has cost real time here, and why | hand |
| **`ARCHITECTURE.md`** | **Shapes, invariants, and edit recipes** | **hand** |
| `CODE-MAP.md` | Line-number index of `index.html` | `node codemap.js` |

---

## The mental model, in one paragraph

**The game is turn-based: a tick fires when the player acts, and at no other
moment.** One action is one tick, and a tick advances everything by one step — the
current flows one cell, every spark takes one step of its patrol. Between two
actions the board is frozen for as long as you like, so planning is a puzzle
activity and never a dexterity one.

Every wire still carries two paths — `intent` (what you drew) and `cells` (how far
the current actually got) — and the active wire spends each tick reconciling
`cells` one step toward `intent`. `intent` can still run ahead: draw into a live
gate and the current holds at its edge while your plan keeps going, then catches up
a cell per move once the way is clear.

There is no ticks-per-second constant any more, because there is no rate. Scores
are counted in **moves**, which is what a tick now is.

### Where a tick comes from

`takeTurn()` is the only thing that spends one during play, and the render loop
cannot. That split is the entire architecture:

| | calls | why |
|---|---|---|
| player input | `takeTurn()` → `stepTick()` | pointer, keyboard, and the Wait button |
| `tick(now)` | nothing | renders; a build gate fails if it touches `stepTick` |
| `replaySolution` / `stageSolution` / `selfTest` | `stepTick()` directly | issuing the solver's own actions; there is no player |

The turn goes **inside** `planTo()`'s unit-step walk, not once per input event.
`planTo` walks the gap between two pointer samples itself, so charging per event
would let a flick that skips four cells pay for one — a fast hand buying moves,
which is the exact exploit the old fixed-timestep accumulator existed to prevent.

This used to be driven by an accumulator fed from `requestAnimationFrame`'s delta.
The model was always turn-based; the metronome was the only thing hiding it.

---

## Coordinates

Cells are **`[col, row]`**, zero-indexed from the top-left. Not `[row, col]` — and
`cols` and `rows` genuinely differ on some boards (`relay-yard` is 7×8), so a
transposed pair does not simply throw, it silently plays a different board.

`CELL` (pixel size) is recomputed per level and per viewport between `MIN_CELL` 32
and `MAX_CELL` 64 so boards fit phones. All drawing and hit-testing reads `CELL`,
so nothing needs to know the size.

---

## Data shapes

### A level

Seven keys, no more. All ten shipped levels have exactly these:

```js
{
  slug: "elbow", name: "Elbow", cols: 7, rows: 7,
  terminals: [
    { color: "#ff5d6c", a:[0,0], b:[6,0] },   // one pair to connect
  ],
  blocked: [[3,2]],                            // soldered components; nothing routes through
  obstacles: [ /* see below */ ]
}
```

- **`slug` — not `id`.** Skins use `id`; levels use `slug`. Grepping for
  `id: 'elbow'` finds nothing and looks like a clean miss. It is not.
- **Level data uses `"double quotes"`**; the rest of the file uses `'single'`.
  A regex written for one style silently misses the other.
- `LEVELS[]` array order **is** the play order shown in the menu.

### Obstacles — there are exactly two kinds

```js
// A gate: blinks on a fixed tick cycle. Live current touching it while on = short.
{ type:'gate', cell:[1,1], periodTicks:10, onTicks:4, phaseTicks:8 }

// A spark: patrols a ping-pong loop. Built by a helper, never written literally.
patrol(2, [[1,4],[5,4],[5,2]])   // ticksPerCell, then corner waypoints
  // -> { ticksPerCell, waypoints, path }
```

`isGate(ob)` is the discriminator — anything not a gate is a patrol.

**`loopPath()` requires each segment to be axis-aligned, and hangs rather than
throws if it is not.** It walks `c += dc` and `r += dr` together and stops only on
an exact hit, so a segment that is neither straight nor a perfect diagonal never
terminates - it grows the path until the heap dies. `decodeLevel()` already
refuses such waypoints, so the untrusted share-code path is guarded; the exposed
trap is for anything that *builds* a patrol, which is why `candidates.js` repeats
the same check before calling it. It found this by hanging on its first run.

**Pass `patrol()` the corners, not the expanded path.** It keeps `waypoints`
precisely because the share codec needs the corners: re-deriving them from an
expanded path guesses wrong the moment a patrol turns, and a share code that
disagrees with the game about where a hazard sits cannot be fixed from outside.

`type:'triangle' | 'square' | 'sine'` in this file are **Web Audio oscillator
types**, not obstacles. Grepping `type:` to enumerate obstacles will mislead you.

### A wire at runtime

```js
wires[colorIndex] = { cells:[[c,r],…], intent:[[c,r],…], locked:false }
```

`cells` is the physical wire — what sparks can short, and what counts for winning.
`intent` is the plan. Editing `intent` costs nothing.

### Settings and skins

```js
SETTINGS_DEFAULTS = { colorblind:false, reduceMotion:false, muted:false, playerName:'' }

SKINS[] = { id, name, flavor, cond, unlocked:()=>bool, tokens:{'--css-var':'#hex'}, badge? }
```

Skin `tokens` are CSS custom properties only. **Skins are cosmetic by contract** —
they must never touch timing, sparks or scoring.

---

## Invariants the build enforces

`build.js` is a gate, not a packager. Each check exists because that failure is
invisible in a browser until a player hits it.

| rule | fails if |
|---|---|
| `sw.js` `CACHE_NAME` contains `GAME_VERSION` | returning players get served the old build from cache |
| `index.html` stays self-contained | no external `<script src>`, stylesheet, `@import`, or `http(s)` URL |
| no debug scaffolding | `__tickOnce`, `debugger;`, `TODO:`, `FIXME` in `index.html` |
| `CODE-MAP.md` is current | the map points at lines that have moved |
| the icon art still matches | `make-icons.mjs`'s bolt path or palette drifted from `icon.svg` |
| every referenced asset ships | the manifest, `sw.js` or a `<link>` names a file not in `RUNTIME_FILES` |
| the zip is well-formed | a nested path was stored with a backslash, or a file is missing |
| the viewport still allows zoom | `user-scalable=no` / `maximum-scale` is back, or the buttons lost `touch-action:manipulation` |
| keyboard focus is visible | no `:focus-visible` rule, no outline width, or no outline-offset |
| non-text contrast holds | `--panel-border` or `--grid-line` measures under 3:1 — in `:root` **or** in any `SKINS[]` override |
| the canvas fallbacks agree | a `cssVar(name, '#hex')` fallback no longer equals the CSS token it duplicates |
| the render loop cannot spend a move | `tick(now)` calls `stepTick`/`takeTurn`, `takeTurn()` stopped calling `stepTick`, or `MS_PER_TICK`/`tickAccum` reappeared |
| the Wait control is reachable | `#waitBtn` missing or unwired, `waitMove()` no longer takes a turn, or `computeCellSize()` stopped reserving `MOVE_ROW_PX` |
| the suite passes | `node test.js` |
| every level still solves and replays | `node solve.js` |

`--no-test` skips the last two. `build.js`'s own comment says not to ship a build
you used it on; take that literally.

## Invariants nothing enforces

**Never assign a wire index to `activeColor` directly — go through
`setActiveColor()`.** It charges `pendingSwitchTicks = 1` for a switch while
running; a direct assignment makes the handoff free, and then the engine and the
scheduler are playing by different rules. That exact bug let ordinary play come in
two ticks under par on Mainframe. Assigning `activeColor = null` directly is fine —
that is clearing, not switching.

**The charge is `if(running)`, not `if(activeColor !== null && running)`**, and the
difference is a bug that has now happened twice. `scheduleSolve()` emits `'F'` for
the first wire it picks up and `'S'` for every wire after — so *the first selection
of a run is free and every later one costs a move*, including picking up a fresh
wire after one finished. The narrower condition looks like the same rule but has a
hole in it: `advanceToNextPlanned()` clears `activeColor` to `null` when a wire
locks with nothing else planned, so the next pick-up read as a first selection.
Under the old clock a player who drew ahead never reached that branch; turn-based
play reaches it on every handoff, and ordinary play came in at 20 against a par of
28. The mirror of this lives in `applyAction`: `'F'` must clear
`pendingSwitchTicks` as well as assign, because `replaySolution` sets `running`
before issuing anything, so a switch is already queued by the time the action
declares itself free.

**When a model and an engine have to agree, test the path a *player* takes.** The
contract test missed the bug above because `replaySolution` issues explicit switch
actions, which *did* charge. The one path under test was the one path already
correct.

**`home` is the root screen; `menu` is the level catalogue.** There are five:
`home | menu | play | settings | editor`. The home screen is one Start/Continue
button plus Daily, Levels, Editor and a collapsed How to play; the catalogue it
replaced is still there, one button away, and still holds the challenge banner —
which is why a `?challenge=` or `?board=` link boots to `menu` rather than `home`.
Drop that line at boot and a shared link opens the game with its invitation
silently discarded.

The campaign position is **derived**, not stored: `nextUnplayedLevel()` is the
first level with no recorded best, falling back to the last so the button is never
dead. A saved pointer would be a second source of truth that can disagree with the
scores on the cards — and a high-water mark would carry you past a board you never
played the moment you cleared a later one from the catalogue.

`playReturn` and `settingsReturn` record which hub you arrived from, because both
hubs reach both sub-screens. `enterLevel()` must only record when `screen` is
`home` or `menu`: it is also how the win modal's **Next** moves through the
campaign, and that call arrives with `screen` already `play`.

**Wait has to exist as a control.** Under a clock you waited by doing nothing,
which needs no input at all. When the world moves only on your action, "let the
spark pass" is a move and needs a way to make it — `Space` or `.` on the keyboard,
and `#waitBtn` on the board. The button is not the convenient version, it is the
*only* version on a touch screen, which is why a build gate owns it. The same gate
watches `MOVE_ROW_PX`: the Wait/Trace row shares the board's column in the
landscape layout, and the board's height budget is computed in JS — leave the row
out of it and the row is pushed off the bottom of a phone, with the board still
looking perfectly playable.

**The board owns Tab, Enter and Space only while it has focus.** `handlePlayKey()`
is split out of the keydown listener precisely so the suite can call it — the stub
DOM cannot dispatch a real key — and it returns whether the game consumed the key,
because *consumed* and *focus cannot move* are the same statement. Capturing those
three unconditionally is what made the play screen a keyboard trap. Arrows, WASD
and Backspace stay global on purpose: they are not focus navigation, so capturing
them costs nothing and keeps the feel of picking up the arrows without clicking the
board first. **Escape is what makes the capture legitimate**, so it is named on
screen twice — `#boardKeys` for screen readers, and the banner's Keyboard line.

**Focus is part of the DOM contract now**, so `harness.js` models it: `el.focus()`
records an owner and `document.activeElement` reads it back. It was a no-op before,
which would have answered "the board is not focused" forever — a silently wrong
result, which is the one thing that stub exists to avoid.

**A test that has never failed with the defect present has not been shown to detect
anything.** `node mutate.js` does this for you: it applies each catalogued defect,
runs the full chain, and reports any that SURVIVE. Add a mutation whenever you add
a gate - a gate with no mutation is an untested claim.

Two traps that tool hit, both worth knowing:

- **A mutation that fails to apply must never read as a result.** Reported as a
  survivor it claims a hole that is not there; reported as caught it claims cover
  that is not there. It is its own outcome.
- **An earlier gate can mask the one under test.** Editing any file stales
  `CODE-MAP.md`, so `checkCodeMap` fired first and hid what was actually being
  measured. The audit regenerates the map before judging.

---

## Recipes — what to touch for a given change

### Add or change a level

0. Optional, but this is where the boards come from now: `node candidates.js`
   searches for a board fitting a difficulty rung, proves it with the same solver
   that will gate it, and prints both a share code (paste into the editor to play
   it) and a `LEVELS[]` literal. It names each pick's shortfalls rather than
   presenting a compromise as a fit.
1. Add the object to `LEVELS[]` (`index.html`, *Level definitions*). Array order is
   play order.
2. `node solve.js <slug>` — proves it routes and prints its par.
3. Put that par number into `PAR_CONTRACT` (keyed by slug). It is hand-mirrored
   there on purpose, so a par that silently moves fails the suite.
   `node solve.js --contract` dumps the **full witness** per level —
   `{par, totalCells, order, paths, actions}` — which is for inspecting the
   schedule, not for pasting: `PAR_CONTRACT` holds only `slug → par`, and the
   contract dump also includes that day's daily, which is not a shipped level.
4. `node codemap.js` — refresh the map.
5. `node test.js` then `node build.js`.

Par is **achievable, not minimal**: the schedule search only builds each wire
contiguously, while the game lets you park a half-built wire. A player beating par
is expected and is the safe direction — gold stays attainable.

### Change a tunable

All in one block (*Tunables*): `TICK_HZ`, `MS_PER_TICK`, `MAX_FRAME_MS`,
`ZAP_PENALTY_TICKS`, `TRACE_MS`. Changing `TICK_HZ` **invalidates every par** —
regenerate `PAR_CONTRACT`.

### Add a setting

`SETTINGS_DEFAULTS` → a toggle in the settings HTML → a cached handle in *Screen
management* → read it in `applySettings()`. Settings persist under
`STORE_PREFIX + 'settings'`.

### Add a skin

Append to `SKINS[]` with an `unlocked()` predicate. `ALL_SKIN_TOKEN_KEYS` derives
itself, so nothing else needs touching. Keep it cosmetic.

### Add or change a shipped asset

Four places, and the build fails if you miss one:

1. the file itself
2. `RUNTIME_FILES` in `build.js` — what gets staged into the zip
3. `CACHE_FILES` in `sw.js` — what works offline
4. whatever references it (`manifest.json` `icons[]`, or a `<link>` in `index.html`)

### Change the app icon

Edit `icon.svg`, then mirror the change into `make-icons.mjs` (`BOLT`,
`BOLT_POINTS`, `BG`, `EDGE`, `GOLD`) and run `node make-icons.mjs`. The generator
duplicates the art instead of parsing the SVG — a general SVG parser would dwarf a
four-shape icon — and `checkIconArt()` is what stops the two copies drifting.

### Re-capture the store screenshots

`node shots.mjs`. Positions come from `stageSolution`, so they restage themselves —
there is no pixel coordinate anywhere in `shots.mjs`, and a UI change just means
running it again. Captures are byte-reproducible; if two runs differ, something
non-deterministic reached the frame and the Chrome flags in `chrome.mjs` are the
place to look.

A shot may declare `scale` (a device pixel ratio) to capture above its CSS size;
the cover uses `width: 630, height: 500, scale: 2`. Set the viewport to the
content's own size and let `scale` do the magnifying — asking for a doubled
*viewport* instead gives a doubled image with the content still at 1× in the
corner, which is how the cover shipped three quarters blank.

Before each capture the tool asserts the root element covers the viewport. That
is the guard against the above, and it fails the run rather than writing a
partly-blank PNG. **Determinism cannot stand in for it** — blank pixels are
perfectly reproducible.

### Bump the version

`GAME_VERSION` in `index.html` **and** `CACHE_NAME` in `sw.js`. The build fails if
they disagree, which is the point.

### Add a test

Assertions live inside `index.html` in `selfTest()` — one definition of "passing",
reached two ways: `node test.js`, and `index.html?test=1` in a browser.

---

## The tooling seam

`window.__wiredDev` is the **only** surface the node tools reach through:

```
solveLevel, routeSolve, replaySolution, LEVELS, TICK_HZ,
generateDailyLevel, loopPath, hazardPeriod, PAR_CONTRACT,
trapMeasure, measurePressure
```

Rename anything in it and both runners break at once. `harness.js` loads the inline
script into a stub DOM under `node:vm`, and both `test.js` and `solve.js` share that
one loader — so a wrong stub shows up in both places rather than one of them quietly
disagreeing.

The stub is deliberately minimal: anything missing throws immediately, which beats a
silently wrong result from an over-helpful fake.

---

## Running it

```bash
python -m http.server 8000
```

`file://` is **not** good enough — service workers cannot register there, and some
browsers strip the query string, which kills `?test=1`.

| | |
|---|---|
| play | `http://localhost:8000/` |
| self test in browser | `http://localhost:8000/?test=1` |
| suite | `node test.js` (`--verbose` lists passing assertions) |
| levels | `node solve.js` (or one slug) — par is in moves |
| propose levels | `node candidates.js` (`--rung`, `--tries`, `--seed`, `--json`) |
| map | `node codemap.js` (`--check` to verify) |
| icons | `node make-icons.mjs` |
| screenshots | `node shots.mjs` |
| release | `node build.js` |
| publish | `node publish.mjs` (`--dry-run` to check without pushing) |
| audit the gates | `node mutate.js` (`--list`, `--verbose`) |

**The release needs PowerShell 7.** Windows PowerShell 5.1's `Compress-Archive`
writes backslashes as the path separator inside the archive, which the zip spec
forbids — `icons/icon-192.png` then 404s once it is on itch. `build.js` prefers
`pwsh`, falls back to `powershell`, and reads the finished archive back either
way, so a bad zip fails the build instead of reaching a player.

---

## Small mismatches worth knowing

- **Skin unlock copy has to restate its own predicate.** Two skins used to
  promise "all three tiers" when there is no tier concept in the data at all —
  both predicates are `LEVELS.every(...)`. Fixed, but the shape recurs: a `cond`
  string is prose that nothing verifies, so it can describe a structure the code
  does not have and no test will object.
- **A full-width block cannot be centred with `margin:0 auto`.** `.boardFrame` is a
  `div`, so it filled its container while the canvas inside stayed left-aligned,
  leaving dead panel beside every board. It needs `width:fit-content` to have a
  width worth centring. Both `.boardFrame` instances hold exactly one `<canvas>`
  and no absolutely-positioned overlay, which is what makes shrink-to-fit safe.
- **Hit-testing reads the canvas rect, never the frame.** `pointerPos()` and
  `editorCellAt()` both measure `canvas.getBoundingClientRect()`, so restyling the
  frame around it cannot desynchronise clicks from cells.
- **`dist/` is gitignored**, so the uploadable zip never travels between machines.
  `node build.js` remakes it. Git can call this repo clean while the artifact you
  would upload is missing or stale.
