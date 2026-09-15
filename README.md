# Wired

A real-time circuit-wiring puzzle. Connect every pair of terminals without crossing paths, route around
the components soldered to the board, and get each trace energized before a patrolling spark shorts it
out. Nothing in the game is random: every spark path, every board, and every tick of the clock is fixed
and repeatable, so two players facing the same board face the identical challenge.

Plays in any modern browser. Installable as a PWA and fully playable offline.

## Repository layout

| File | What it is |
|---|---|
| `index.html` | The entire game — markup, styles, and logic in one file |
| `manifest.json` | PWA manifest |
| `sw.js` | Cache-first service worker for offline play |
| `icon.svg` | App icon (hand-authored vector) |
| `icons/` | PNG app icons for install prompts — generated, committed |
| `make-icons.mjs` | Rasterizes `icons/` from the same art as `icon.svg` |
| `LICENSE` | All rights reserved — see below |
| `build.js` | Packages `dist/wired-<version>.zip` for upload |
| `test.js` / `harness.js` | Headless runner for the in-page test suite |
| `solve.js` | Proves every level routes and verifies its par |
| `codemap.js` | Generates `CODE-MAP.md`; `--check` proves it is current |
| `ARCHITECTURE.md` | Data shapes, invariants, and edit recipes — start here |
| `CODE-MAP.md` | Generated line-number index of `index.html` — do not hand-edit |
| `store/` | itch.io cover art and page copy (drafts) |

## The zero-dependency rule

**Wired has no third-party dependencies of any kind, and this is a constraint to maintain rather than a
coincidence to note.**

- No libraries or frameworks. No npm, no bundler, no build step.
- No web fonts — the CSS uses the system font stack only.
- No audio files — every sound is synthesized at runtime through the Web Audio API.
- No bundled images beyond `icon.svg`. The board is drawn entirely on canvas; the UI is CSS.
- No analytics, no ads, no network calls, no backend. The game never phones home.

Two separate properties depend on this and both break together:

1. **Self-contained distribution.** The game is a file you can double-click, email, or drop on any static
   host. Adding an external request makes it a thing that needs a network and a CDN's uptime.
2. **Clean licensing.** Nothing in Wired requires anyone else's permission. Adding a web font, a code
   library, an audio sample, or a stock image introduces a license obligation to track and comply with.

So: adding a CDN `<script>`, a Google Font, an analytics snippet, or a sound file is not a small
convenience — it ends both properties in one move. If something genuinely warrants it, inline and
self-host the asset and record its license here before merging.

Emoji used in the UI (⚡ 🥇 🎯) render from the *player's* system font and are never redistributed, so
they carry no obligation in-game. Store artwork is different — see the note in `LICENSE` and the launch
plan before building a cover around a system emoji glyph.

## Building for release

```bash
node build.js
```

Writes `dist/wired-<version>.zip` with `index.html` at the **root** — itch.io requires that, or the
upload plays as a file listing instead of a game. Only runtime files ship.

The build refuses to package if any of these fail, because each one is invisible until a player hits
it:

- the test suite doesn't pass, or any level stops solving;
- `sw.js`'s `CACHE_NAME` doesn't match `GAME_VERSION` (a stale cache serves returning players the old
  build forever);
- `index.html` stops being self-contained (external script, stylesheet, `@import`, or an http URL);
- debug scaffolding is left behind.

## Running it

Open `index.html` in a browser. That's the whole procedure.

For anything involving the service worker or URL parameters (challenge links, `?test=1`), serve it over
HTTP instead — service workers cannot register on `file://`, and some browsers strip query strings there:

```bash
python -m http.server 8000
```

## Levels are solver-verified

No level ships that the solver can't prove is finishable, and no medal threshold is guessed.

```bash
node solve.js
```

Proves each board routes, computes its par, and verifies that par by replaying it through the real game
engine. `node solve.js --contract` emits the solution contract; `PAR_CONTRACT` in `index.html` holds the
committed numbers, and the test suite re-derives par and asserts it still matches — so retuning a level
or changing a rule breaks loudly instead of silently moving par.

**Par is achievable, not proven minimal.** The schedule search only considers building each wire
contiguously, while the game also allows parking a half-built wire to run another, so a player can beat
par. That's the safe direction: every par ships with a witness we replay, so gold is always attainable. A
par that was too low would make gold impossible.

Boards are scored on three measured axes, and a level with zero on all of them is a straight-line race
with no decisions in it:

- **detour** — wire cells beyond the straight-line minimum, so routing around something is really required.
- **holds** — ticks spent waiting, so the hazards constrain the run. This is a *band*, not a maximum:
  tuning found placements scoring 56 holds, which is a wire sitting idle for nine seconds — not a hard
  level, a boring one.
- **trap** — share of plausible routes that seal the board. Finishing a wire is irreversible, so a
  wire completed along the wrong route can strand another pair permanently.

Difficulty ordering uses these, not par, and the difference is not academic: **Fault Line's par (38) is
lower than Backplane's (39) while its trap density is 76% against 0%.** Ordering the set by par would
have buried the finale in the middle.

A capped route enumeration reports *no* trap number rather than a low one, because routes that were never
generated would silently count as safe and drag the figure toward zero.

## The board-sealed warning

Because trap is real, the game watches for it. When a wire locks, it re-checks whether every unfinished
pair can still be connected, and says so if not — naming the pair that got cut off.

It only ever warns when the search **proved** the board unwinnable. A budget timeout produces silence,
never a warning: telling someone their winnable board is hopeless would make them abandon a level they
were about to solve, which is far worse than staying quiet. The test suite asserts both halves — that it
fires on a genuinely sealed board, and that it stays quiet on a healthy one.

## The board editor

Build a board, hit Verify, get a share code. The code is the board as text, base64url'd — no server, no
accounts, no database, no moderation queue, and the game keeps every offline property it had. A 6×6 board
with two pairs, two components, a patrol and a gate comes to 88 characters.

Two properties do the work:

- **A board that can't be proved finishable gets no code.** Most level editors ship broken levels with
  invented pars because nobody can check. This one refuses, and says which way it failed: unroutable,
  unschedulable, too big, or *couldn't verify* — which is treated as a refusal, not a maybe.
- **Par is re-derived on import, never carried in the code.** There is no par field to forge. A
  hand-edited code claiming an impossible target simply gets corrected, and anything that doesn't decode
  cleanly is rejected outright rather than half-read.

The size cap is 7×7 because that is where certainty actually ends. Measured against random boards at a
4,000,000-node budget: **7×7 resolved 40/40** (worst case ~3.4s), **8×8 only 29–39/40** — and the 8×8
failures did not improve from 400k to 4M, so those instances are hard rather than starved. Fewer pairs is
harder, not easier: more empty space means more routes to rule out.

## Tests

```bash
node test.js
```

Assertions live inside `index.html` as `selfTest()`, returning plain data and touching no DOM. `test.js`
only supplies an environment: it extracts the inline script, evaluates it under `node:vm` against a stub
DOM, and calls that same function. The browser path (`index.html?test=1`, served over HTTP) calls it too,
so there is one definition of "passing" rather than two that can drift.

Exits non-zero on failure. Pass `--verbose` to list passing assertions as well.

Tests build their own throwaway levels rather than asserting against the shipped ones, and search for
conditions instead of hard-coding tick numbers — a test pinned to "the spark is at [0,2] on tick 3"
fails the moment a level is retuned, while the engine is perfectly fine, and that noise is what teaches
people to ignore a red suite.

## Accessibility

These are shipped features, not aspirations, and changes should preserve them:

- **Color is never the only signal.** Every wire color carries a distinct shape glyph *and* a distinct
  dash pattern, for all players — not gated behind the colorblind toggle.
- **Colorblind palette** verified distinguishable *pairwise* under deuteranopia, protanopia, and
  tritanopia — not merely one color at a time.
- **Reduce Motion** genuinely disables the pulsing, flashing, and intro animation rather than softening
  them.
- **Full keyboard play** — Tab/Shift+Tab select a wire, arrows or WASD extend it, Backspace steps back.

## License

All rights reserved. See [LICENSE](LICENSE). The game is free to play; the source is readable for study,
not reusable. Player-authored level codes belong to the players who create them.
