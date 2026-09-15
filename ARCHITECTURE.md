# Wired — architecture and editing guide

The orientation layer. `CODE-MAP.md` says *where* things are; this says *what shape*
they are and *what to touch* for a given change. It is hand-written and deliberately
names shapes rather than line numbers, so it does not rot when the file moves around.

| doc | job | maintained by |
|---|---|---|
| `README.md` | Design doc — the rules and their reasoning | hand |
| `CLAUDE.md` | The branch situation, and what has cost real time | hand |
| **`ARCHITECTURE.md`** | **Shapes, invariants, and edit recipes** | **hand** |
| `CODE-MAP.md` | Line-number index of `index.html` | `node codemap.js` |

---

## The mental model, in one paragraph

Drawing a route is **free and instant** — planning is a puzzle activity, not a
dexterity one. Current is **slow**: exactly one cell per tick, down exactly one wire
at a time. So every wire carries two paths — `intent` (what you drew) and `cells`
(how far the current actually got). The active wire spends each tick reconciling
`cells` one step toward `intent`. That single rule is why a frantic drag cannot
finish a wire inside one frame, and it is the whole game.

`TICK_HZ = 6`, so a tick is ~167 ms. Scores are counted in **ticks**, never
milliseconds — the engine is deterministic and wall-clock never enters the model.

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

**When a model and an engine have to agree, test the path a *player* takes.** The
contract test missed the bug above because `replaySolution` issues explicit switch
actions, which *did* charge. The one path under test was the one path already
correct.

**A test that has never failed with the defect present has not been shown to detect
anything.** Reintroduce the bug in a scratch copy and watch the test go red before
you trust it.

---

## Recipes — what to touch for a given change

### Add or change a level

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
| levels | `node solve.js` (or one slug) |
| map | `node codemap.js` (`--check` to verify) |
| release | `node build.js` |

---

## Small mismatches worth knowing

- **Two skins promise "all three tiers"** (`full-board`, `zero-shorts`) but there is
  no tier concept anywhere in the data — their `unlocked()` predicates are
  `LEVELS.every(...)`, i.e. all ten levels. The copy is describing a structure the
  code does not have. Harmless today; misleading if tiers ever get added for real.
- **`dist/` is gitignored**, so the uploadable zip never travels between machines.
  `node build.js` remakes it. Git can call this repo clean while the artifact you
  would upload is missing or stale.
