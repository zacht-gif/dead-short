# wired — read this before changing anything

A real-time circuit-routing puzzle, one self-contained HTML file plus a PWA
shell. `C:\dev\CLAUDE.md` above this covers machines, git identity and syncing.

**`README.md` is the design doc and it is a good one** — the zero-dependency
rule, how levels are solver-verified, the three difficulty axes, the
board-sealed warning, the test philosophy and the accessibility guarantees all
live there with their reasoning. Read it before changing anything. This file is
deliberately the things the README does *not* say.

---

## The branch, before anything else

**`main` is the default branch on GitHub and it is not where the work is.**

| | |
|---|---|
| `main` | `ffa4856` — 90 KB `index.html`, PNG `icons/`, `screenshots/`, `tools/build.ps1`, `tools/make-icons.mjs`, `tools/make-screenshots.mjs`, `ITCH-IO-PAGE.md` |
| `tick-model-and-routing` | `88d5cef` — 205 KB `index.html`, `build.js`, `store/`, `solve.js`, `test.js`, `harness.js`. **The real game** |

The two **diverged at the initial commit** (`f784491`), so this is not a branch
that is merely behind — it is two independent packaging efforts from the same
starting point, 5 commits against 1. The branch carries the tick model, the
solvers, the level set and the editor; `main` carries an icon-and-screenshot
toolchain the branch replaced with a single hand-authored `icon.svg`.

Nothing is *broken* by this — I checked, and the branch's `manifest.json` and
`sw.js` reference only files that exist on the branch. The cost is subtler: a
clone, a fresh machine, or GitHub's own web view all land on `main` and see a
game missing everything. Anyone starting here from scratch starts on the wrong
one.

Resolve it by deciding which packaging approach wins and merging, or by
retargeting the default branch — not by copying files between the two.

## Private, proprietary, and not published

- **The repo is private.** cut-and-fill is public; don't carry habits across.
- All rights reserved, and the licence explicitly covers level designs, name
  and visual identity.
- **Nothing is published yet.** No Pages, no itch page. `CANONICAL_URL` is
  still `''` (`index.html:680`), the `store/` assets are drafts, and the four
  screenshots named in `store/README.md` still have to be captured from a real
  browser. The pre-publish checklist is at the end of `store/itch-page.md`.

---

## The rules that are not style preferences

**`build.js` is the enforcer, not a packager.** It refuses to produce a zip if
the suite fails, if any level stops solving, if `sw.js`'s `CACHE_NAME` doesn't
contain `GAME_VERSION`, if `index.html` stops being self-contained, or if debug
scaffolding survived. Each gate exists because that failure is invisible in a
browser until a player hits it. The README explains the reasoning; what it
doesn't spell out is that **`TODO:` and `FIXME` in `index.html` fail the
build** — you cannot park a note in the game file and ship.

**`--no-test` exists and build.js's own comment tells you not to ship a build
you used it on.** Take that literally.

**A player beating par is expected, not a bug.** Par is a schedule proven
*reachable* — the search only builds each wire contiguously, while the game
lets you park a half-built wire. That direction is the safe one: gold stays
attainable. Before "fixing" a sub-par run, read the next section, because the
one time this really *was* a bug it looked exactly the same from outside.

**itch needs `index.html` at the zip root**, not inside a folder, or the upload
plays as a file listing instead of a game.

---

## Things that have cost real time

- **The engine and the model playing by different rules.**
  `advanceToNextPlanned()` assigned `activeColor` directly instead of going
  through `setActiveColor`, so the automatic handoff when a wire finished was
  *free*, while the scheduler charged a tick for it. Ordinary play beat par on
  Mainframe. It was caught by looking at a screenshot, not by the suite.
- **The contract test missed it because `replaySolution` issues explicit switch
  actions — which did charge.** The one path under test was the one path that
  was already correct. When a model and an engine have to agree, test the path
  a *player* takes, not the path the tooling takes.
- **The test written to catch it was itself wrong first.** It ticked a fixed
  600 times regardless of when the win happened, inflating every score into the
  hundreds and hiding the very thing it existed to detect. It was settled by
  reintroducing the bug in a temp copy: 3 levels came in under par with it, 0
  without. That is the standard here — **a test that has never failed with the
  defect present has not been shown to detect anything.**
- **itch does not forward query strings into the embedded game.** A challenge
  link pointing at the store page opens the game without the challenge.
  Anything built on share links has to survive that.
- **`file://` is not good enough** for the service worker or for `?test=1` —
  service workers cannot register there and some browsers strip query strings.
  Use `python -m http.server 8000`.
- **`dist/` is gitignored, so the zip never travels between machines.** The
  recurring shape from the root `CLAUDE.md`: git can call this repo clean while
  the artifact you would upload is missing or stale. `node build.js` remakes it.
- **Empty search results.** Same as everywhere: prove the search matched
  something before trusting a clean result.

---

## Where things stand

On `tick-model-and-routing`, verified 2026-09-13: **310/310 assertions pass**,
and all ten shipped levels plus that day's daily solve and replay clean with
routing proven minimal on every one. v2.0.0. The build produces
`dist/wired-2.0.0.zip`.

The open work is not code. In order: decide the branch question above, then
walk the pre-publish checklist in `store/itch-page.md` — principally the
`CANONICAL_URL` decision and the note about the name. Screenshots and a cover
pass are the last thing between this and a store page.
