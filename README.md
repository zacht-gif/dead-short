# Dead Short

A circuit-wiring puzzle against a clock. Connect every pair of terminals without crossing paths, route around
the components soldered to the board, and get each trace energized without a patrolling spark shorting it
out. **The board advances three moves a second whether you act or not**, from your first move onward:
the current flows one cell, and every spark takes one step of its patrol. Nothing is random, so two
players facing the same board face the identical puzzle — and two players making the same moves post
the identical time, because the clock is the move count and never a sampled one.

**Drawing costs nothing.** A drag only plans the route, and a flick costs exactly what a careful drag
costs, so no part of this is a test of hand speed. Your score is the time on the clock: one cell of
route is a move, switching to another color is a move, and a short adds 1.67s.

**`Untimed practice`** in Settings turns the clock off entirely — one move per action, nothing moving
while you think — and records nothing at all, so it can never stand in for a run you played.

Plays in any modern browser. Installable as a PWA and fully playable offline **when served from a page
of its own** — see `Where it is published` below, because the itch build is the exception.

## Repository layout

| File | What it is |
|---|---|
| `index.html` | The entire game — markup, styles, and logic in one file |
| `manifest.json` | PWA manifest |
| `sw.js` | Cache-first service worker for offline play |
| `icon.svg` | App icon (hand-authored vector) |
| `icons/` | PNG app icons for install prompts — generated, committed |
| `make-icons.mjs` | Rasterizes `icons/` from the same art as `icon.svg` |
| `shots.mjs` / `chrome.mjs` | Captures `store/screenshots/` from the real game |
| `LICENSE` | All rights reserved — see below |
| `build.js` | Packages `dist/dead-short-<version>.zip` for upload |
| `publish.mjs` | Runs every gate, then pushes to itch with butler |
| `test.js` / `harness.js` | Headless runner for the in-page test suite |
| `solve.js` | Proves every level routes and verifies its par |
| `candidates.js` | Searches for boards that fit a difficulty rung; proposes, never decides |
| `codemap.js` | Generates `CODE-MAP.md`; `--check` proves it is current |
| `mutate.js` | Mutation audit — introduces each known defect and checks something catches it |
| `ARCHITECTURE.md` | Data shapes, invariants, and edit recipes — start here |
| `CODE-MAP.md` | Generated line-number index of `index.html` — do not hand-edit |
| `store/` | itch.io page copy, cover art, and generated `screenshots/` |

## The zero-dependency rule

**Dead Short has no third-party dependencies of any kind, and this is a constraint to maintain rather than a
coincidence to note.**

- No libraries or frameworks. No npm, no bundler, no build step.
- No web fonts — the CSS uses the system font stack only.
- No audio files — every sound is synthesized at runtime through the Web Audio API.
- No third-party art. The only images shipped are `icon.svg` and the PNG icons rasterized from it by
  `make-icons.mjs`; the board is drawn entirely on canvas and the UI is CSS.
- No analytics, no ads, no network calls, no backend. The game never phones home.

Two separate properties depend on this and both break together:

1. **Self-contained distribution.** The game is a file you can double-click, email, or drop on any static
   host. Adding an external request makes it a thing that needs a network and a CDN's uptime.
2. **Clean licensing.** Nothing in Dead Short requires anyone else's permission. Adding a web font, a code
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

Writes `dist/dead-short-<version>.zip` with `index.html` at the **root** — itch.io requires that, or the
upload plays as a file listing instead of a game. Only runtime files ship.

The build refuses to package if any of these fail, because each one is invisible until a player hits
it (seventeen gates now, the last nine of them accessibility and architecture ones the test suite
physically cannot see — `selfTest()` runs against a stub DOM with no CSS and no layout):

- the test suite doesn't pass, or any level stops solving;
- `sw.js`'s `CACHE_NAME` doesn't match `GAME_VERSION` (a stale cache serves returning players the old
  build forever);
- `index.html` stops being self-contained (external script, stylesheet, `@import`, or an http URL);
- debug scaffolding is left behind;
- `CODE-MAP.md` is out of date, so the index would point at lines that have moved;
- `make-icons.mjs`'s copy of the art has drifted from `icon.svg`;
- the manifest, `sw.js` or a `<link>` names a file that is not in `RUNTIME_FILES`, so the zip would
  ship without it;
- the viewport meta blocks pinch-zoom, or the buttons have lost `touch-action:manipulation`;
- there is no `:focus-visible` rule, or it has no outline-offset to lift the ring off the button fill;
- `--panel-border` or `--grid-line` measures under 3:1 against what it sits on, in `:root` or in any
  skin — computed, not pinned;
- a `cssVar()` fallback in the canvas code disagrees with the CSS token it duplicates;
- the render loop can advance the simulation, or a fixed-timestep accumulator has reappeared — put
  either back and nothing goes red, the game simply starts playing itself again while you think;
- the `Wait` control is gone, unwired, free, or left out of the board's landscape height budget — on a
  touch screen it is the only way to let a spark pass, so losing it makes half the game unreachable
  with the board still looking perfectly playable;
- anything the simulation can see reads the wall clock — `stepTick`, `propagateActiveWire`,
  `currentScore`, `cellIsHot` and `obstacleCellAt` are checked function by function, because even the
  time trial below drives the board through the tick count and never through the clock itself;
- the metronome stops beating at a fixed rate — `TRIAL_HZ` must stay a plain number and the interval
  must come from it, or the time trial runs at a different speed on every machine and no two times
  mean the same thing;
- the store screenshots no longer match the game they were taken from. They are generated, not
  captured, and they go stale exactly the way `dist/` does — silently. A warning in `build.js`, since
  a stale screenshot cannot break the game and regenerating needs Chrome; a hard failure under
  `publish.mjs`, which is the step where stale marketing actually reaches somebody;
- the finished zip is malformed — a nested path stored with a backslash, or a file missing.

`node mutate.js` audits those gates by introducing each defect and checking something goes red.

## Where it is published

```bash
node publish.mjs --dry-run   # every gate, stage the tree, push nothing
node publish.mjs             # every gate, then butler push
```

itch.io is canonical. A GitHub Pages mirror serves the same files and is deliberately kept out of this
README, every announcement and every link that is handed to anyone: itch ranks partly on plays and
views, so a play that lands on the mirror is a discovery signal itch never sees. The mirror exists for
durable share links and for the install path below, not for traffic.

Uploading by hand is the step where a rebuild stops being a deploy — the repo can be clean, the tests
green, and the thing players load a month old, because nothing in git touches what itch serves. So the
upload is one command, and it refuses to run on a game that does not pass all seventeen gates.

**The PWA does not work inside the itch embed.** The install prompt does not fire in a third-party
iframe, and the service worker is unreliable under third-party storage partitioning — so on itch,
`manifest.json` and the PNG icons are inert and offline play should not be promised. Both work normally
on the mirror, which is the only place the install is real. They still ship in the zip because the same
files serve both hosts and the cost is a few KB.

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

**Par is in moves, and it is the same number it always was.** Turn-based play changed who spends a tick,
not what a tick costs: `scheduleSolve()` has always searched a list of turns, and `replaySolution()` has
always driven the engine one action at a time. Every shipped par came through the change unchanged.

Par charges for three things, and the engine has to charge for all three or the two disagree:

| | cost |
|---|---|
| one cell of wire | 1 move |
| selecting a wire, **after the first** | 1 move |
| a hold — waiting rather than advancing | 1 move |

That middle row is the one that keeps going wrong. It has now been mis-charged twice, both times on the
automatic handoff when a wire finishes, and both times with par, every replay and the whole contract test
staying green — because `replaySolution()` issues the solver's own action list and so tests the
scheduler's arithmetic against itself. The suite plays the **pointer** path now, and a hazard-free clone
of every shipped board asserts that a real run costs exactly `totalCells + pairs - 1`.

**Par is achievable, not proven minimal.** The schedule search only considers building each wire
contiguously, while the game also allows parking a half-built wire to run another, so a player can beat
par. That's the safe direction: every par ships with a witness we replay, so gold is always attainable. A
par that was too low would make gold impossible.

Boards are scored on three measured axes, and a level with zero on all of them is a straight-line race
with no decisions in it:

- **detour** — wire cells beyond the straight-line minimum, so routing around something is really required.
- **holds** — moves spent waiting, so the hazards constrain the run. This is a *band*, not a maximum:
  tuning found placements scoring 56 holds, which is 56 moves of pressing Wait — not a hard level, a
  boring one.
- **trap** — share of plausible routes that seal the board. Finishing a wire is irreversible, so a
  wire completed along the wrong route can strand another pair permanently.

Difficulty ordering uses these, not par, and the difference is not academic: **Fault Line's par (38) is
lower than Backplane's (39) while its trap density is 76% against 0%.** Ordering the set by par would
have buried the finale in the middle.

A capped route enumeration reports *no* trap number rather than a low one, because routes that were never
generated would silently count as safe and drag the figure toward zero.

## The front door

The game opens on one button. `Start` on a fresh save, `Continue` after that,
pointing at the first level with no recorded best — plus `Daily`, `Levels`,
`Editor`, and the rules folded into a `How to play` disclosure.

It used to open on the level catalogue: ten cards each carrying a grid size, a pair
count, a component count, a spark count, a best score and a gold target, plus a
daily card, an editor card and a seven-line paragraph of rules. Roughly forty
numbers to read, and the first thing asked of a new player was a choice they had no
basis for making. The catalogue is unchanged and one button away, for when picking a
specific board is the thing you actually want; it is also still where a challenge
link lands, since that is where the banner offering it lives.

The position is derived from the recorded bests rather than saved beside them.
There is no pointer to migrate and no way for one to disagree with the cards — and
clearing a later board out of order cannot carry the button past one you have never
played, which is what a high-water mark would do.

## The time trial — which is the whole game

There is no second mode. Your first move starts a clock at `TRIAL_HZ` — three moves a second — and
from then on the current flows a cell and every spark takes one step of its patrol three times a
second, whether you act or not. Your score is the time on that clock.

**The clock is the tick count.** Nothing samples `performance.now()`. A tick *is* 1/`TRIAL_HZ` of a
second, so the score in seconds is the score in ticks divided by the rate — which means two players
making identical moves are worth identical times on any machine, and a stuttering laptop cannot hand
its owner a worse run for the same play. Every other number in the game is already in ticks (par,
`PAR_CONTRACT`, the medal thresholds, share codes, the daily), so one integer answers every question
and only the display divides.

**Medals are time targets.** Gold is par, silver `par×1.25`, bronze `par×1.6` — unchanged, still in
ticks, now shown as seconds. On Breadboard gold is 4.67s, which is par 14 at three a second: a target
that allows almost no dithering, because under a clock every moment of thought is a beat spent.

**Drawing still costs nothing.** This is the part that keeps it a puzzle. Under the metronome a drag
only *plans* the route; the clock is the sole thing that spends moves, so a flick and a careful drag
cost exactly the same and no amount of hand speed buys anything. If both the clock and the input
advanced the board it would be an APM contest, and the accessibility pass would be undone.

**A short costs seconds, not points.** `ZAP_PENALTY_TICKS` is in ticks and `currentScore()` already
adds it, so the penalty needs no conversion at all: five ticks at three a second is **1.67s**, charged
the instant the wire dies, and then you pay again to rebuild it. Without it, shorting would be free in
a game whose only score is the clock, and the fastest line through a hot cell would be to walk into
it — which inverts the entire point of the hazard. The banner computes the figure from the two
constants rather than stating it, because a hard-coded "1.67s" becomes a lie the day either moves.

## Practice

Off by default, in Settings, and it is the accessibility half of the game. Turn it on and the clock
stops existing: the board advances **one move per action** and nothing moves while you think, which is
how a level gets learned rather than raced. A player who needs to take their time has somewhere to
take it.

**It records nothing.** No best, no medal, no daily streak, no cosmetic unlock, not even the play
count. That is not tidiness — a mode with the clock off that still fed the same records would be the
fastest way to farm every one of them, and the medal thresholds *are* times, so a run that was never
raced cannot have earned one. Recording is all-or-nothing behind a single flag rather than four
guards that can drift apart one commit at a time.

The `Wait` control exists for this mode and only this mode. With the clock running, doing nothing is
already waiting, so the button would spend nothing and do nothing; with the clock off, letting a spark
pass has to *be* an input, and on a touch screen the button is the only way to make one — lose it and
a player whose only safe move is to wait has no legal move at all. A build gate checks all of it: that
the button exists, that it is wired, that `waitMove()` costs a move, that it **refuses** outside
practice (hiding the button is otherwise the only thing stopping a free move, and a keyboard reaches
the function without touching the button), and that it is hidden when the clock runs.

The rules are written down in **four** places — the play banner, the Settings text, the screen-reader
description above the board, and this file — and practice swaps all of them together. The
screen-reader copy is the one that rots unseen: it went on describing a turn-based game for a day
after the metronome landed, where by definition nobody sighted would ever notice.

**The clock never touches the simulation.** The metronome calls `stepTick()`, which still knows
nothing but `tickCount`; sparks patrol "on the clock" only because the clock advances that counter.
So `obstacleCellAt` and `cellIsHot` stay pure functions of the tick, the daily is still the same
puzzle for everybody, and the gate sealing those five functions needs no exception carved into it.

**The rate is gated because it is the whole defence.** 3/sec has to be 3/sec on a gaming desktop and
on a five-year-old phone, or the level is a different level on each and nobody's time means anything.
`TRIAL_HZ` must stay a plain literal, the interval must derive from it, and the render loop is barred
from calling the metronome — a board stepping once per painted frame runs at 144/sec on a good monitor
and 30 on a phone, which is the old accumulator bug wearing a new name.

Two things follow that are easy to miss. **Waiting is the default, not a move**, so the `Wait` button
is hidden — a live control with no job is its own kind of bug. And **the play screen's rules banner is
swapped for a different one**, because every sentence of the turn-based banner ("nothing moves until
you do") is false under the clock, and this game has already lost a week to rules that drifted out of
date in a place nobody remembered to look.

The clock arithmetic came wholesale from cut-and-fill, including the two parts that are easy to get
wrong: elapsed time is a pure function (`playedMs`) so the suite can check it against made-up stamps
instead of trying to steer `performance.now()`, and it clamps at zero because three independent
subtractions can go negative and a negative time would be written down as somebody's fastest. Hidden
stretches are banked on `visibilitychange` rather than `blur`, and the metronome refuses to beat while
the tab is hidden — glancing at another window should not hand you back a wrecked board.

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

## Designing a level

```bash
node candidates.js                 # search every rung, print the best fits
node candidates.js --rung 50       # just that rung
node candidates.js --tries 9000 --seed 11
```

Levels are hand-chosen, but not designed on a blank grid. `candidates.js`
generates boards, proves each one with the same solver `build.js` will later gate
it with, scores it on the three axes above, and prints the best fits for each rung
of a ramp — with a share code you can paste straight into the editor and play, and
a `LEVELS[]` literal for the one it likes best.

**It proposes; it does not decide.** Every pick prints what it *fails* to meet —
`COMPROMISE: holds 1 - hazards barely bite` — because a search returns the best
thing it found, which is not the same as a thing that fits, and a board printed
under "finale" with no note reads as a finale.

Two things it measured that are worth knowing before designing anything:

- **Board shape decides whether trap happens at all.** Over 2,073 verified boards:
  `shifted` (staggered top-to-bottom, the daily's shape) averaged 22.8% trap and
  `nested` (interleaved endpoints) 18.5%, while `same-edge` managed 3.9%. If a
  level needs to teach commitment, its endpoints have to interleave.
- **At the high end, trap and holds trade against each other.** A board where most
  plausible routes seal is a board so constrained that there is only one timing
  left to find, so holds collapse toward zero. Every candidate at the two hardest
  rungs was a compromise on one axis or the other — and so, measured the same way,
  is the shipped finale.

The run is deterministic: the same `--seed` and `--tries` give the same proposals.

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
  them, and it starts switched on for anyone whose *system* already asks for reduced motion. That is a
  default, not an override: ticking it off here outranks the OS, because it is the more specific
  statement of the two.
- **Waiting is a control, not an absence.** The world only moves when the player does, so "let the spark
  go past" needs an input. `Wait` is a button on the board and `Space` or `.` on the keyboard. On touch
  there is no keyboard to fall back on, which makes the button the whole of it — a build gate checks it
  is present, wired, costs a move, and is inside the board's height budget in landscape, because the
  first version of that row was pushed off the bottom of a phone screen.
- **Full keyboard play, including the buttons.** Tab/Shift+Tab select a wire, arrows or WASD extend it,
  Backspace steps back, Space or `.` waits — and **Esc leaves the board** for Restart, Share and Menu.
  The board is a
  `role="application"` region, so it only owns those keys while it holds focus; everywhere else they do
  the ordinary browser thing. Until 2026-09-17 they were captured for the whole play screen, which meant
  focus could never reach any button on it and the win dialog's **Next** was unreachable — so the game
  could not be finished without a mouse. That was a real WCAG 2.1.2 failure and this line used to
  describe it as a feature.
- **Focus is visible.** A 2px ring, offset so it lands on the surface behind the control rather than
  inside its own fill — cyan on the gold primary buttons is 1.04:1, which is why the browser default
  (1.36:1 there) could not be seen at all.
- **Pinch-zoom works.** The viewport does not set `user-scalable=no`; the gesture that actually needed
  suppressing was double-tap-to-zoom, and `touch-action:manipulation` on the buttons does that without
  taking zoom away from anyone. The two are a pair — dropping one without adding the other gives every
  button a 300ms tap delay back.
- **Component boundaries and the board grid clear 3:1.** `build.js` measures this from the tokens rather
  than pinning hex literals, and it measures the `SKINS[]` overrides too — three skins override exactly
  the two tokens involved, so checking `:root` alone would pass a build where most skins failed.

## License

All rights reserved. See [LICENSE](LICENSE). The game is free to play; the source is readable for study,
not reusable. Player-authored level codes belong to the players who create them.
