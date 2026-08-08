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
| `LICENSE` | All rights reserved — see below |

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

Boards are scored on two measured axes, and a level with zero on both is a straight-line race with no
decisions in it:

- **detour** — wire cells beyond the straight-line minimum, so routing around something is really required.
- **holds** — ticks spent waiting, so the hazards constrain the run. This is a *band*, not a maximum:
  tuning found placements scoring 56 holds, which is a wire sitting idle for nine seconds — not a hard
  level, a boring one.

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
